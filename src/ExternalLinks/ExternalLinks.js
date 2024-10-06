import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, push, onValue, update } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { ExternalLink, Trash2 } from 'lucide-react';

function ExternalLinks() {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ url: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    const linksRef = ref(database, 'externalLinks');
    onValue(linksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const linksList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setLinks(linksList);
      }
    });
  }, []);

  const addLink = () => {
    const linksRef = ref(database, 'externalLinks');
    push(linksRef, {
      ...newLink,
      addedBy: user.email,
      addedAt: new Date().toISOString(),
      status: 'active',
    });
    setNewLink({ url: '', description: '' });
  };

  const deleteLink = (id) => {
    const linkRef = ref(database, `externalLinks/${id}`);
    update(linkRef, { status: 'deleted' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>External Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-grow space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex-grow space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Enter a description"
              />
            </div>
            <Button onClick={addLink} className="self-end">Add Link</Button>
          </div>
          <ScrollArea className="h-[300px]">
            {links.filter(link => link.status !== 'deleted').map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 border-b">
                <div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {link.description || link.url}
                  </a>
                  <div className="text-sm text-gray-500">
                    Added by {link.addedBy} on {new Date(link.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteLink(link.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExternalLinks;