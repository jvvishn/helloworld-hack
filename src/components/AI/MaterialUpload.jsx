// Replace the handleUpload function with:
const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  try {
    // Call Amy's AI processing backend
    const result = await aiStudyService.uploadLectureMaterial(
      selectedFile, 
      materialType, 
      subject
    );

    showSuccess('File uploaded and processed successfully!');
    onUploadComplete(result);
    
    // Reset form
    setSelectedFile(null);
    setSubject('');
    setMaterialType('lecture');
  } catch (error) {
    showError('Upload failed. Please try again.');
    console.error('Upload error:', error);
  } finally {
    setUploading(false);
  }
};