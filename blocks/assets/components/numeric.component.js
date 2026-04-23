import { __ } from "@wordpress/i18n";
import {
  RangeControl,
  ToolsPanel,
  ToolsPanelItem,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem,
} from "@wordpress/components";

// --- Main Component ---
const NumericComponent = ({
  title = "Dimensions",
  options = [],
  attributeName = "dimensions",
  subAttributeName = null,
  attributes,
  setAttributes,
}) => {
  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  const isNested = !!subAttributeName;

  const getValue = (key) => {
    const parentAttribute = attributes[attributeName] || {};
    if (isNested) {
      const nestedObject = parentAttribute[subAttributeName] || {};
      return nestedObject[key];
    }
    return parentAttribute[key];
  };

  const updateValue = (key, value) => {
    let numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      numericValue = undefined;
    }

    const currentAttributeValue = attributes[attributeName] || {};
    let newAttributeValue = { ...currentAttributeValue };

    if (isNested) {
      const currentNestedObject = currentAttributeValue[subAttributeName] || {};
      let newNestedObject = { ...currentNestedObject };

      if (numericValue === undefined) {
        delete newNestedObject[key];
      } else {
        newNestedObject[key] = numericValue;
      }

      if (Object.keys(newNestedObject).length === 0) {
        // If the nested object becomes empty, delete the subAttributeName key
        // This is usually preferred for cleaner data, but ensure your block's attribute
        // definition for `attributeName` allows for `subAttributeName` to be missing.
        delete newAttributeValue[subAttributeName];
      } else {
        newAttributeValue[subAttributeName] = newNestedObject;
      }
    } else {
      if (numericValue === undefined) {
        delete newAttributeValue[key];
      } else {
        newAttributeValue[key] = numericValue;
      }
    }

    // IMPORTANT: If `newAttributeValue` becomes completely empty,
    // setting `attributeName: {}` is usually fine.
    // However, if your block's `attributes` definition for `attributeName`
    // has a `source` (like 'meta' or 'attribute') and expects a non-empty object
    // at all times, this could cause issues.
    // For now, let's keep it as is, assuming `attributeName` itself is just a simple object.

    setAttributes({
      [attributeName]: newAttributeValue,
    });
  };

  const checkHasValue = (key) => {
    const parentAttribute = attributes[attributeName];
    if (!parentAttribute || typeof parentAttribute !== "object") return false;

    if (isNested) {
      const nestedObject = parentAttribute[subAttributeName];
      if (!nestedObject || typeof nestedObject !== "object") return false;
      const val = nestedObject[key];
      return val !== undefined && val !== null && val !== "";
    } else {
      const val = parentAttribute[key];
      return val !== undefined && val !== null && val !== "";
    }
  };

  const resetItem = (key) => {
    updateValue(key, undefined);
  };

  const resetAll = () => {
    const currentAttributeValue = attributes[attributeName] || {};
    let newAttributeValue = { ...currentAttributeValue };

    if (isNested) {
      // For nested, setting to an empty object
      // This is generally safe if `attributes[attributeName]` is itself an object,
      // and `subAttributeName` can be an empty object.
      newAttributeValue[subAttributeName] = {};
    } else {
      options.forEach((item) => {
        delete newAttributeValue[item.key];
      });
    }

    setAttributes({
      [attributeName]: newAttributeValue,
    });
  };

  return (
    <WP_ToolsPanel
      label={title}
      className="numeric-block-tools-panel"
      resetAll={options.length > 0 ? resetAll : undefined}
    >
      {options.map((item) => {
        const hasValue = checkHasValue(item.key);
        const currentValue = hasValue ? getValue(item.key) : item.min ?? 0;

        return (
          <WP_ToolsPanelItem
            key={item.key}
            label={item.label}
            hasValue={() => hasValue}
            onDeselect={() => resetItem(item.key)}
            isShownByDefault={item.isShownByDefault}
          >
            <RangeControl
              label={item.label}
              value={currentValue}
              onChange={(val) => updateValue(item.key, val)}
              min={item.min ?? 0}
              max={item.max ?? 100}
              step={item.step ?? 1}
              allowReset={false}
              withInputField={true}
              help={item.unit ? `${__("Unit:")} ${item.unit}` : undefined}
            />
          </WP_ToolsPanelItem>
        );
      })}
    </WP_ToolsPanel>
  );
};

export { NumericComponent };
