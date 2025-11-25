import React from 'react';
import { getLocalizedName, getLocalizedDescription } from '../../Utils/languageUtils';
import { useLanguage } from '../../Hooks/useLanguage';

/**
 * Component for displaying localized content
 * @param {Object} item - Category or Product object with translations
 * @param {string} type - 'name' or 'description' or 'both'
 * @param {string} className - CSS class name
 * @param {React.Component} as - HTML element or component to render as
 * @param {Object} props - Additional props to pass to the rendered element
 */
export const LocalizedContent = ({ 
  item, 
  type = 'both', 
  className, 
  as: Component = 'div',
  ...props 
}) => {
  const { currentLanguage } = useLanguage();

  if (!item) return null;

  const localizedName = getLocalizedName(item, currentLanguage);
  const localizedDescription = getLocalizedDescription(item, currentLanguage);

  if (type === 'name') {
    return <Component className={className} {...props}>{localizedName}</Component>;
  }

  if (type === 'description') {
    return <Component className={className} {...props}>{localizedDescription}</Component>;
  }

  if (type === 'both') {
    return (
      <Component className={className} {...props}>
        <div className="localized-name">{localizedName}</div>
        {localizedDescription && (
          <div className="localized-description">{localizedDescription}</div>
        )}
      </Component>
    );
  }

  return null;
};

/**
 * Hook for getting localized content
 * @param {Object} item - Category or Product object
 * @returns {Object} - Object with localized name and description
 */
export const useLocalizedContent = (item) => {
  const { currentLanguage } = useLanguage();
  
  return {
    name: getLocalizedName(item, currentLanguage),
    description: getLocalizedDescription(item, currentLanguage)
  };
};

export default LocalizedContent;




