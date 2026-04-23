import { __ } from "@wordpress/i18n";
import {
    FontSizePicker,
    ToolsPanel,
    ToolsPanelItem,
    __experimentalToolsPanel,
    __experimentalToolsPanelItem,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";

/**
 * FontSizeComponent
 *
 * Replicates the WordPress default font size picker behavior using theme.json presets.
 */
const FontSizeComponent = ({
  title = __("Typography"),
  attributeName = "typography", // e.g., 'slider' or 'content'
  attributes,
  setAttributes,
  options = [], // [{ key: 'fontSize', label: 'Font Size' }]
}) => {
  // 1. Fetch Font Sizes from theme.json / Editor Settings
  const { fontSizes, disableCustomFontSizes } = useSelect((select) => {
    const settings = select(blockEditorStore).getSettings();
    return {
      fontSizes: settings.fontSizes || [],
      disableCustomFontSizes: settings.disableCustomFontSizes || false,
    };
  }, []);

  // 2. Component Fallbacks (Compatibility)
  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  // 3. Update Logic
  const updateFontSize = (itemKey, newValue) => {
    const parentObj = attributes[attributeName] || {};

    setAttributes({
      [attributeName]: {
        ...parentObj,
        [itemKey]: newValue,
      },
    });
  };

  const getFontSizeValue = (itemKey) => {
    return attributes[attributeName]?.[itemKey];
  };

  return (
    <WP_ToolsPanel
      label={title}
      resetAll={() => {
        const parentObj = attributes[attributeName] || {};
        // Clear only the keys defined in options
        const resetSizes = { ...parentObj };
        options.forEach((opt) => delete resetSizes[opt.key]);

        setAttributes({
          [attributeName]: resetSizes,
        });
      }}
    >
      {options.map((item) => {
        const currentValue = getFontSizeValue(item.key);

        return (
          <WP_ToolsPanelItem
            key={item.key}
            label={item.label}
            hasValue={() => !!currentValue}
            onDeselect={() => updateFontSize(item.key, undefined)}
            isShownByDefault
          >
            <FontSizePicker
              __next40pxDefaultSize
              label={item.label}
              fontSizes={fontSizes}
              value={currentValue}
              disableCustomFontSizes={disableCustomFontSizes}
              onChange={(newSize) => updateFontSize(item.key, newSize)}
            />
          </WP_ToolsPanelItem>
        );
      })}
    </WP_ToolsPanel>
  );
};

export { FontSizeComponent };
