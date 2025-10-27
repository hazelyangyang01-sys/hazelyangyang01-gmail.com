import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]); // remove the data:image/...;base64, part
      } else {
        reject(new Error('Failed to read file as base64 string'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ImageEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceImage(file);
      setSourceImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null); // Clear previous edit
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const base64Data = await fileToBase64(sourceImage);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: sourceImage.type,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          setEditedImageUrl(imageUrl);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            创意画板
            </h1>
            <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
            >
                返回主菜单
            </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            {/* Left side: Upload and original image */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700">1. 上传图片</h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {sourceImageUrl && (
                    <div className="mt-4 border-2 border-gray-300 rounded-lg p-2">
                        <p className="text-center font-semibold text-gray-600 mb-2">原始图片</p>
                        <img src={sourceImageUrl} alt="Source" className="w-full h-auto object-contain rounded-md max-h-80" />
                    </div>
                )}
            </div>

            {/* Right side: Prompt and result */}
            <div className="flex flex-col gap-4">
                 <h2 className="text-2xl font-semibold text-gray-700">2. 输入指令</h2>
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：给图片加上复古滤镜，或者移除背景里的人..."
                    rows={3}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                 />
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !sourceImage || !prompt}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
                 >
                    {isLoading ? '生成中...' : '开始创作！'}
                 </button>
                 
                 {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                 
                 {isLoading && (
                    <div className="flex justify-center items-center mt-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
                    </div>
                 )}

                 {editedImageUrl && !isLoading && (
                     <div className="mt-4 border-2 border-purple-400 rounded-lg p-2 bg-purple-50">
                        <p className="text-center font-semibold text-purple-700 mb-2">创作完成！</p>
                        <img src={editedImageUrl} alt="Edited" className="w-full h-auto object-contain rounded-md max-h-80" />
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
