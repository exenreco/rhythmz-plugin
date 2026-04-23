const 
iconsList = [
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
    { name: "", icon: "", html: "", keywords: []},
],
layouts = () => {
    const API = {
        create: (tagName = "", props = {}) => {
            
            const 

            // 1. Create the DOM element
            element = document.createElement(tagName),
            
            // 2. Define the function to map properties to attributes
            applyProperties = (properties = {}) => {
                Object.keys(properties).forEach(key => {
                const value = properties[key];

                // LOGIC: Convert camelCase (dataTest) to kebab-case (data-test)
                // If the key is already kebab-case (data-test), this regex changes nothing.
                const attrName = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);

                // Handle 'className' edge case for standard HTML 'class'
                if (key === 'className') {
                    element.setAttribute('class', value);
                } 
                // Apply the attribute
                else {
                    element.setAttribute(attrName, value);
                }
                });
            };

            // 3. Execute logic and return the element
            applyProperties(props);
            return element;
        },   
    };
    return API;
};


export { iconsList, layouts }
