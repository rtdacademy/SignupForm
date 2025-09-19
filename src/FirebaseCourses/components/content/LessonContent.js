import React from 'react';

/**
 * Component for displaying lesson content
 * 
 * @param {Object} props
 * @param {String} props.lessonId - Unique ID of the lesson
 * @param {String} props.title - Title of the lesson
 * @param {React.ReactNode} props.children - Content of the lesson
 * @param {Object} props.metadata - Additional lesson metadata
 */
const LessonContent = ({ lessonId, title, children, metadata = {} }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      </div>
      
      <div className="prose max-w-none">
        {children}
      </div>
    </div>
  );
};

/**
 * Text section component for structured content within lessons
 */
export const TextSection = ({ title, children }) => {
  return (
    <section className="mb-8">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="text-gray-700">{children}</div>
    </section>
  );
};

/**
 * Media section for embedding videos, images etc. in lessons
 */
export const MediaSection = ({ type, src, alt, caption }) => {
  const renderMedia = () => {
    switch (type) {
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src={src} 
              title={alt || 'Video content'} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        );
      case 'image':
        return (
          <img 
            src={src} 
            alt={alt || 'Lesson image'} 
            className="rounded-lg max-w-full h-auto"
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <figure className="mb-8">
      <div className="overflow-hidden rounded-lg bg-gray-50">
        {renderMedia()}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * Summary section for lesson takeaways
 */
export const LessonSummary = ({ points = [] }) => {
  if (!points.length) return null;
  
  return (
    <section className="mt-12 p-6 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Key Takeaways</h2>
      <ul className="space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 mr-3 mt-0.5 text-sm font-semibold">
              {index + 1}
            </span>
            <span className="text-blue-800">{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default LessonContent;