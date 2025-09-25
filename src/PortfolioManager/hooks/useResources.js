import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';

export const useResources = (familyId, studentId) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [libraryResources, setLibraryResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const storage = getStorage();
  const unsubscribeRefs = useRef([]);

  const isValid = familyId && studentId;

  const getUserRole = useCallback(() => {
    if (!user) return 'unknown';

    if (user.email?.includes('@rtdacademy.com') ||
        user.customClaims?.role === 'staff' ||
        user.role === 'staff') {
      return 'facilitator';
    }

    return 'parent';
  }, [user]);

  const uploadResourceFile = async (file, path) => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fullPath = `portfolios/${familyId}/resources/${path}/${fileName}`;

      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      let thumbnailUrl = null;
      if (file.type.startsWith('image/')) {
        thumbnailUrl = url;
      }

      return {
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        path: fullPath,
        thumbnailUrl,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const createResource = useCallback(async (resourceData, file = null) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const batch = writeBatch(db);

    let fileData = null;
    if (file) {
      const attachmentPath = resourceData.attachedTo ?
        `${resourceData.attachedTo.level}/${resourceData.attachedTo.id}` :
        'general';
      fileData = await uploadResourceFile(file, attachmentPath);
    }

    const resourceId = doc(collection(db, 'temp')).id;
    const resourceRef = doc(db, `portfolios/${familyId}/resources`, resourceId);

    const userRole = getUserRole();
    const isStaff = userRole === 'facilitator';

    const newResource = {
      id: resourceId,
      title: resourceData.title,
      description: resourceData.description || '',
      type: resourceData.type,
      content: resourceData.content || null,
      url: fileData?.url || resourceData.url || null,
      file: fileData || null,
      tags: resourceData.tags || [],
      attachedTo: resourceData.attachedTo || null,
      library: {
        isInLibrary: resourceData.addToLibrary || false,
        libraryId: isStaff ? user.uid : familyId,
        libraryType: isStaff ? 'personal' : 'family',
        sharedWith: []
      },
      metadata: {
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdByRole: userRole,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        usageCount: 0,
        lastUsedAt: null
      },
      permissions: {
        canEdit: [user.uid],
        canView: ['all'],
        canShare: isStaff
      }
    };

    batch.set(resourceRef, newResource);

    if (resourceData.addToLibrary) {
      const libraryId = isStaff ? user.uid : familyId;
      const libraryRef = doc(db, `resourceLibraries/${libraryId}/resources`, resourceId);
      batch.set(libraryRef, {
        ...newResource,
        libraryMetadata: {
          addedAt: serverTimestamp(),
          addedBy: user.uid,
          category: resourceData.category || 'general',
          featured: false
        }
      });
    }

    if (resourceData.attachedTo) {
      let targetRef;
      const { level, id } = resourceData.attachedTo;

      if (level === 'entry') {
        targetRef = doc(db, `portfolios/${familyId}/entries`, id);
      } else if (level === 'collection' || level === 'portfolio') {
        targetRef = doc(db, `portfolios/${familyId}/structure`, id);
      }

      if (targetRef) {
        batch.update(targetRef, {
          resourceCount: increment(1),
          lastResourceAddedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();

    return resourceId;
  }, [user, isValid, familyId, db, storage, getUserRole]);

  const updateResource = useCallback(async (resourceId, updates) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const resourceRef = doc(db, `portfolios/${familyId}/resources`, resourceId);
    await updateDoc(resourceRef, {
      ...updates,
      'metadata.lastModified': serverTimestamp()
    });

    const userRole = getUserRole();
    const isStaff = userRole === 'facilitator';
    const libraryId = isStaff ? user.uid : familyId;
    const libraryRef = doc(db, `resourceLibraries/${libraryId}/resources`, resourceId);

    const libraryDoc = await getDoc(libraryRef);
    if (libraryDoc.exists()) {
      await updateDoc(libraryRef, {
        ...updates,
        'metadata.lastModified': serverTimestamp()
      });
    }
  }, [user, isValid, familyId, db, getUserRole]);

  const deleteResource = useCallback(async (resourceId) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const batch = writeBatch(db);

    const resourceRef = doc(db, `portfolios/${familyId}/resources`, resourceId);
    const resourceDoc = await getDoc(resourceRef);

    if (!resourceDoc.exists()) {
      throw new Error('Resource not found');
    }

    const resourceData = resourceDoc.data();

    if (resourceData.file?.path) {
      const fileRef = ref(storage, resourceData.file.path);
      try {
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete file:', err);
      }
    }

    batch.delete(resourceRef);

    if (resourceData.library?.isInLibrary) {
      const libraryRef = doc(db, `resourceLibraries/${resourceData.library.libraryId}/resources`, resourceId);
      batch.delete(libraryRef);
    }

    if (resourceData.attachedTo) {
      let targetRef;
      const { level, id } = resourceData.attachedTo;

      if (level === 'entry') {
        targetRef = doc(db, `portfolios/${familyId}/entries`, id);
      } else if (level === 'collection' || level === 'portfolio') {
        targetRef = doc(db, `portfolios/${familyId}/structure`, id);
      }

      if (targetRef) {
        batch.update(targetRef, {
          resourceCount: increment(-1)
        });
      }
    }

    await batch.commit();
  }, [user, isValid, familyId, db, storage]);

  const addResourceFromLibrary = useCallback(async (libraryResourceId, attachTo) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const userRole = getUserRole();
    const isStaff = userRole === 'facilitator';
    const libraryId = isStaff ? user.uid : familyId;

    const libraryRef = doc(db, `resourceLibraries/${libraryId}/resources`, libraryResourceId);
    const libraryDoc = await getDoc(libraryRef);

    if (!libraryDoc.exists()) {
      throw new Error('Library resource not found');
    }

    const libraryResource = libraryDoc.data();

    const newResourceData = {
      ...libraryResource,
      attachedTo: attachTo,
      library: {
        ...libraryResource.library,
        isInLibrary: false,
        sourceLibraryId: libraryId,
        sourceResourceId: libraryResourceId
      },
      metadata: {
        ...libraryResource.metadata,
        addedFromLibraryAt: serverTimestamp(),
        addedBy: user.uid,
        usageCount: increment(1),
        lastUsedAt: serverTimestamp()
      }
    };

    delete newResourceData.libraryMetadata;

    const batch = writeBatch(db);

    const resourceId = doc(collection(db, 'temp')).id;
    const resourceRef = doc(db, `portfolios/${familyId}/resources`, resourceId);

    batch.set(resourceRef, {
      ...newResourceData,
      id: resourceId
    });

    batch.update(libraryRef, {
      'metadata.usageCount': increment(1),
      'metadata.lastUsedAt': serverTimestamp()
    });

    if (attachTo) {
      let targetRef;
      const { level, id } = attachTo;

      if (level === 'entry') {
        targetRef = doc(db, `portfolios/${familyId}/entries`, id);
      } else if (level === 'collection' || level === 'portfolio') {
        targetRef = doc(db, `portfolios/${familyId}/structure`, id);
      }

      if (targetRef) {
        batch.update(targetRef, {
          resourceCount: increment(1),
          lastResourceAddedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();

    return resourceId;
  }, [user, isValid, familyId, db, getUserRole]);

  const getResourcesForItem = useCallback(async (level, itemId) => {
    if (!isValid) return [];

    const resourcesRef = collection(db, `portfolios/${familyId}/resources`);
    const q = query(
      resourcesRef,
      where('attachedTo.level', '==', level),
      where('attachedTo.id', '==', itemId),
      orderBy('metadata.createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const resourcesList = [];
    snapshot.forEach(doc => {
      resourcesList.push({ id: doc.id, ...doc.data() });
    });

    return resourcesList;
  }, [isValid, familyId, db]);

  useEffect(() => {
    if (!isValid || !user) {
      setLoadingResources(false);
      return;
    }

    unsubscribeRefs.current.forEach(unsub => unsub());
    unsubscribeRefs.current = [];

    const resourcesRef = collection(db, `portfolios/${familyId}/resources`);
    const q = query(resourcesRef, orderBy('metadata.createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resourcesList = [];
        snapshot.forEach((doc) => {
          resourcesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setResources(resourcesList);
        setLoadingResources(false);
      },
      (err) => {
        console.error('Error loading resources:', err);
        setError(err.message);
        setLoadingResources(false);
      }
    );

    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribeRefs.current.forEach(unsub => unsub());
    };
  }, [isValid, user, familyId, db]);

  useEffect(() => {
    if (!user) {
      setLoadingLibrary(false);
      return;
    }

    const userRole = getUserRole();
    const isStaff = userRole === 'facilitator';
    const libraryId = isStaff ? user.uid : familyId;

    if (!libraryId) {
      setLoadingLibrary(false);
      return;
    }

    const libraryRef = collection(db, `resourceLibraries/${libraryId}/resources`);
    const q = query(libraryRef, orderBy('libraryMetadata.addedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const libraryList = [];
        snapshot.forEach((doc) => {
          libraryList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setLibraryResources(libraryList);
        setLoadingLibrary(false);
      },
      (err) => {
        console.error('Error loading library:', err);
        setLoadingLibrary(false);
      }
    );

    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribe();
    };
  }, [user, familyId, db, getUserRole]);

  const shareResourceToFamily = useCallback(async (resourceId, targetFamilyId) => {
    if (!user || getUserRole() !== 'facilitator') {
      throw new Error('Only facilitators can share resources to other families');
    }

    const resourceRef = doc(db, `resourceLibraries/${user.uid}/resources`, resourceId);
    const resourceDoc = await getDoc(resourceRef);

    if (!resourceDoc.exists()) {
      throw new Error('Resource not found in your library');
    }

    const resourceData = resourceDoc.data();

    const targetLibraryRef = doc(db, `resourceLibraries/${targetFamilyId}/resources`, resourceId);

    await setDoc(targetLibraryRef, {
      ...resourceData,
      library: {
        ...resourceData.library,
        libraryId: targetFamilyId,
        libraryType: 'family',
        sharedFrom: user.uid,
        sharedAt: serverTimestamp()
      },
      libraryMetadata: {
        addedAt: serverTimestamp(),
        addedBy: user.uid,
        category: resourceData.libraryMetadata?.category || 'shared',
        featured: false,
        sharedFromFacilitator: true
      }
    });

    await updateDoc(resourceRef, {
      'library.sharedWith': [...(resourceData.library.sharedWith || []), targetFamilyId]
    });
  }, [user, db, getUserRole]);

  return {
    resources,
    libraryResources,
    loadingResources,
    loadingLibrary,
    error,

    createResource,
    updateResource,
    deleteResource,
    addResourceFromLibrary,
    getResourcesForItem,
    shareResourceToFamily,

    getUserRole
  };
};

export default useResources;