export const loadTutorial = async (tutorialId) => {
    try {
      const tutorial = await import(`./content/${tutorialId}.js`);
      return tutorial.default;
    } catch (error) {
      console.error(`Failed to load tutorial: ${tutorialId}`, error);
      throw error;
    }
  };