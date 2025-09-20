import React, { useState, useEffect } from 'react';
import MaterialUpload from '../components/AI/MaterialUpload';
import StudyMaterialsGenerator from '../components/AI/StudyMaterialsGenerator';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const StudyMaterials = () => {
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    // Load previously uploaded materials from localStorage
    const savedMaterials = localStorage.getItem('uploadedMaterials');
    if (savedMaterials) {
      setUploadedMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  const handleUploadComplete = (material) => {
    const updatedMaterials = [...uploadedMaterials, material];
    setUploadedMaterials(updatedMaterials);
    localStorage.setItem('uploadedMaterials', JSON.stringify(updatedMaterials));
    setSelectedMaterial(material);
  };

  const selectMaterial = (material) => {
    setSelectedMaterial(material);
  };

  const deleteMaterial = (materialId) => {
    const updatedMaterials = uploadedMaterials.filter(m => m.id !== materialId);
    setUploadedMaterials(updatedMaterials);
    localStorage.setItem('uploadedMaterials', JSON.stringify(updatedMaterials));
    
    if (selectedMaterial && selectedMaterial.id === materialId) {
      setSelectedMaterial(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Study Materials</h1>
        <p className="text-gray-600">
          Upload your lecture materials and let AI generate personalized study guides, quizzes, and flashcards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload and Materials List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Component */}
          <MaterialUpload onUploadComplete={handleUploadComplete} />

          {/* Uploaded Materials List */}
          {uploadedMaterials.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Materials</h3>
              <div className="space-y-2">
                {uploadedMaterials.map((material) => (
                  <div
                    key={material.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMaterial?.id === material.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectMaterial(material)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {material.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {material.materialType} • {new Date(material.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMaterial(material.id);
                        }}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - AI Generator */}
        <div className="lg:col-span-2">
          <StudyMaterialsGenerator uploadedMaterial={selectedMaterial} />
        </div>
      </div>

      {/* Features Overview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          AI-Powered Study Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Study Guides</h3>
            <p className="text-gray-600 text-sm">
              AI extracts key concepts and creates comprehensive study guides with organized sections and important formulas.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Quizzes</h3>
            <p className="text-gray-600 text-sm">
              Generate customized quizzes with multiple choice, short answer, and true/false questions based on your materials.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Flashcards</h3>
            <p className="text-gray-600 text-sm">
              Create digital flashcards for quick review and memorization of key terms, definitions, and concepts.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;