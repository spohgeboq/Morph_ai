import React, { useState } from 'react';
import { Send, Image as ImageIcon, Sparkles } from 'lucide-react';

const GeneratorForm = ({ activeService }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Здесь будет отправка запроса на наш бэкенд
      const endpoint = activeService === 'image' 
        ? 'http://localhost:5000/api/generate/image' 
        : 'http://localhost:5000/api/generate/text';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('Произошла ошибка при генерации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (activeService) {
      case 'text':
        return 'Опишите тему для поста, статьи или идеи...';
      case 'image':
        return 'Опишите, какое изображение вы хотите создать...';
      case 'story':
        return 'Начните вашу историю, а ИИ продолжит её...';
      default:
        return 'Введите ваш запрос...';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Генерация...';
    switch (activeService) {
      case 'text': return 'Создать текст';
      case 'image': return 'Сгенерировать арт';
      case 'story': return 'Продолжить историю';
      default: return 'Отправить';
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return <div className="spinner" />;
    switch (activeService) {
      case 'text': return <Send size={18} />;
      case 'image': return <ImageIcon size={18} />;
      case 'story': return <Sparkles size={18} />;
      default: return <Send size={18} />;
    }
  };

  return (
    <div className="generator-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Ваш запрос</label>
          <textarea
            className="form-textarea"
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isLoading || !prompt.trim()}
        >
          {getButtonIcon()}
          {getButtonText()}
        </button>
      </form>

      {result && (
        <div className="result-container">
          <h3 className="result-title">Результат</h3>
          {activeService === 'image' && result.startsWith('http') ? (
            <img src={result} alt="Generated result" className="result-image" />
          ) : (
            <div className="result-content">{result}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratorForm;
