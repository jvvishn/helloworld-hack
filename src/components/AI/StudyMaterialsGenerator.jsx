// Replace the generateMaterial function with:
const generateMaterial = async (type, options = {}) => {
  setGenerating(prev => ({ ...prev, [type]: true }));
  
  try {
    let result;
    
    switch (type) {
      case 'studyGuide':
        result = await aiStudyService.generateStudyGuide(uploadedMaterial.id, options);
        break;
      case 'quiz':
        result = await aiStudyService.generateQuiz(uploadedMaterial.id, options);
        break;
      case 'flashcards':
        result = await aiStudyService.generateFlashcards(uploadedMaterial.id, options);
        break;
      default:
        throw new Error('Unknown material type');
    }

    if (result.success || result.data) {
      const materialData = result.data || result[type] || result.studyGuide || result.quiz || result.flashcards;
      setGeneratedMaterials(prev => ({
        ...prev,
        [type]: materialData
      }));
      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
    } else {
      throw new Error('Generation failed');
    }
  } catch (error) {
    showError(`Failed to generate ${type}. Please try again.`);
    console.error(`Generate ${type} error:`, error);
  } finally {
    setGenerating(prev => ({ ...prev, [type]: false }));
  }
};