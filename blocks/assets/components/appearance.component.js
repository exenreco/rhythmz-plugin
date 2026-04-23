import { __ } from "@wordpress/i18n";
import { useState, useRef } from "@wordpress/element";
import {
  Popover,
  TabPanel,
  ToolsPanel,
  ToolsPanelItem,
  ColorPalette,
  GradientPicker,
  __experimentalToolsPanel,
  __experimentalGradientPicker,
  __experimentalToolsPanelItem,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { typography } from "@wordpress/icons";

// --- Helper Sub-Component for the Innermost Tabs (Solid vs Gradient) ---
const SingleColorControl = ({
  label,
  itemKey, // This is the full key like 'metaTextColor' or 'slideBgColorHover'
  attributes,
  setAttributes,
  attributeName,
  subAttributeName,
  themeColors,
  themeGradients,
  hasColor,
  hasGradient,
}) => {
  // Helper to get nested value
  const getValue = (key) => {
    let currentAttributes = attributes[attributeName];
    if (
      subAttributeName &&
      currentAttributes && // Ensure currentAttributes exists before accessing subAttributeName
      currentAttributes[subAttributeName]
    ) {
      currentAttributes = currentAttributes[subAttributeName];
    }
    return currentAttributes?.colors?.[key];
  };

  const solidValue = getValue(itemKey);
  // Ensure gradient value is undefined if it's an empty string for the picker
  let gradientValue = getValue(`${itemKey}Gradient`);
  if (gradientValue === "") gradientValue = undefined;

  const updateValue = (type, value) => {
    const parentAttribute = attributes[attributeName] || {};
    let targetObject = parentAttribute;

    if (subAttributeName) {
      if (!parentAttribute[subAttributeName]) {
        parentAttribute[subAttributeName] = {};
      }
      targetObject = parentAttribute[subAttributeName];
    }

    const currentColors = targetObject.colors || {};
    const newColors = { ...currentColors };

    if (type === "color") {
      newColors[itemKey] = value;
      if (hasGradient) {
        // Only clear gradient if gradients are an option for this control
        newColors[`${itemKey}Gradient`] = undefined;
      }
    } else if (type === "gradient") {
      newColors[`${itemKey}Gradient`] = value;
      if (hasColor) {
        // Only clear solid if solid colors are an option for this control
        newColors[itemKey] = undefined;
      }
    }

    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parentAttribute,
          [subAttributeName]: {
            ...targetObject,
            colors: newColors,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: {
          ...parentAttribute,
          colors: newColors,
        },
      });
    }
  };

  const WP_GradientPicker = GradientPicker || __experimentalGradientPicker;

  const tabs = [];
  if (hasColor) tabs.push({ name: "solid", title: __("Solid") });
  if (hasGradient) tabs.push({ name: "gradient", title: __("Gradient") });

  if (tabs.length === 0) {
    return <p>{__("No color or gradient options available for " + label)}</p>;
  }

  // If only one option (solid or gradient), display it directly without a TabPanel
  if (tabs.length === 1) {
    const tab = tabs[0];
    return (
      <div style={{ marginTop: "16px" }}>
        {tab.name === "solid" && (
          <ColorPalette
            colors={themeColors}
            value={solidValue}
            onChange={(val) => updateValue("color", val)}
            clearable
          />
        )}
        {tab.name === "gradient" && (
          <WP_GradientPicker
            value={gradientValue}
            onChange={(val) => updateValue("gradient", val)}
            gradients={themeGradients}
            clearable
          />
        )}
      </div>
    );
  }

  return (
    <TabPanel
      className="solid-gradient-tabs"
      activeClass="is-active"
      tabs={tabs}
    >
      {(tab) => (
        <div style={{ marginTop: "16px" }}>
          {tab.name === "solid" && (
            <ColorPalette
              colors={themeColors}
              value={solidValue}
              onChange={(val) => updateValue("color", val)}
              clearable
            />
          )}

          {tab.name === "gradient" && (
            <WP_GradientPicker
              value={gradientValue}
              onChange={(val) => updateValue("gradient", val)}
              gradients={themeGradients}
              clearable
            />
          )}
        </div>
      )}
    </TabPanel>
  );
};

// --- Main Component ---
const AppearanceComponent = ({
  title = "Appearance",
  options = [], // Now expects the new before/after structure
  attributeName = "slider",
  subAttributeName,
  attributes,
  setAttributes,
}) => {
  const [openPickerKey, setOpenPickerKey] = useState(null);

  // Fetch Theme Colors
  const { themeColors, themeGradients } = useSelect((select) => {
    const { getSettings } = select("core/block-editor");
    const settings = getSettings();
    return {
      themeColors: settings.colors || [],
      themeGradients: settings.gradients || [],
    };
  }, []);

  // Component Fallbacks for experimental APIs
  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  // Helper to get the correct colors object based on subAttributeName
  const getColorsObject = () => {
    let currentAttributes = attributes[attributeName];
    if (
      subAttributeName &&
      currentAttributes &&
      currentAttributes[subAttributeName]
    ) {
      currentAttributes = currentAttributes[subAttributeName];
    }
    return currentAttributes?.colors || {};
  };

  // NEW/FIXED: Helper to resolve CSS background string for preview circles
  const getPreviewStyle = (stateObject) => {
    if (!stateObject) return {};

    const colors = getColorsObject();

    let itemKeyForPreview = "";
    let isGradientAllowed = false;

    // Determine what to preview based on existence and preference
    // Background takes precedence for the overall preview circle
    if (stateObject.hasBackground && stateObject.backgroundKey) {
      itemKeyForPreview = stateObject.backgroundKey;
      isGradientAllowed = stateObject.hasBackgroundGradient;
    } else if (stateObject.hasText && stateObject.textKey) {
      // Ensure textKey exists here
      // If no background, but has text, we can use text color as a fallback for the circle's solid background
      itemKeyForPreview = stateObject.textKey;
      isGradientAllowed = false; // Text color generally doesn't use gradients for the circle background
    }

    if (!itemKeyForPreview) return {}; // No valid key to generate a preview from

    const solidValue = colors[itemKeyForPreview];
    const gradientValue = isGradientAllowed
      ? colors[`${itemKeyForPreview}Gradient`] === ""
        ? undefined
        : colors[`${itemKeyForPreview}Gradient`]
      : undefined;

    // Determine the actual background style to apply
    if (gradientValue) {
      return {
        backgroundImage: gradientValue,
        backgroundSize: "cover", // Gradients usually cover the area
        backgroundRepeat: "no-repeat",
        backgroundColor: "transparent", // Background color isn't needed with a gradient
      };
    } else if (solidValue && solidValue !== "transparent") {
      return {
        backgroundColor: solidValue,
        backgroundImage: "none", // Explicitly no image for solid color
        backgroundSize: "auto", // Reset to default or omit
        backgroundRepeat: "no-repeat", // Solid color doesn't repeat anyway, but for consistency
      };
    } else {
      // It's transparent or undefined, show the checkerboard if background options are present
      if (stateObject.hasBackground) {
        return {
          backgroundImage:
            "conic-gradient(#eee 0.25turn, transparent 0.25turn 0.5turn, #eee 0.5turn 0.75turn, transparent 0.75turn)",
          backgroundSize: "8px 8px",
          backgroundRepeat: "repeat",
          backgroundColor: "transparent",
        };
      }
      return {}; // No background options means no checkerboard
    }
  };

  // NEW: Helper to get the text color for the icon fill
  const getTextColor = (stateObject) => {
    // Add null/undefined check for stateObject itself and its properties
    if (!stateObject || !stateObject.hasText || !stateObject.textKey) {
      return "currentColor"; // Default or fallback
    }

    const colors = getColorsObject();
    const textKey = stateObject.textKey;

    // Prioritize solid color
    if (colors[textKey]) {
      return colors[textKey];
    }

    // Fallback to gradient if available
    // Ensure the gradient key exists before trying to access it
    if (colors[`${textKey}Gradient`]) {
      // For SVG fill, refer to a defined gradient ID.
      // Note: This assumes the gradient is already defined in an SVG <defs> tag,
      // which the GradientPicker typically handles by adding a global SVG.
      // If the gradient isn't in a <defs>, this might not render correctly.
      return `url(#${textKey}Gradient)`;
    }

    return "currentColor"; // Default if neither is set
  };

  // Helper to check if item has any value set across before/after, text/background
  const checkHasValue = (item) => {
    const c = getColorsObject();
    let hasAnyValue = false;

    const checkStateValue = (state) => {
      if (!state) return false;
      if (
        state.hasText &&
        state.textKey &&
        (!!c[state.textKey] || !!c[`${state.textKey}Gradient`])
      )
        return true;
      if (
        state.hasBackground &&
        state.backgroundKey &&
        (!!c[state.backgroundKey] || !!c[`${state.backgroundKey}Gradient`])
      )
        return true;
      return false;
    };

    if (checkStateValue(item.before)) hasAnyValue = true;
    if (checkStateValue(item.after)) hasAnyValue = true;

    return hasAnyValue;
  };

  const clearColorKeys = (itemData, newColors) => {
    // Add check for itemData
    if (!itemData) return;

    if (itemData?.hasText && itemData.textKey) {
      delete newColors[itemData.textKey];
      delete newColors[`${itemData.textKey}Gradient`];
    }
    if (itemData?.hasBackground && itemData.backgroundKey) {
      delete newColors[itemData.backgroundKey];
      delete newColors[`${itemData.backgroundKey}Gradient`];
    }
  };

  return (
    <WP_ToolsPanel
      label={title}
      className="events-block-tools-panel"
      resetAll={() => {
        const parentAttribute = attributes[attributeName] || {};
        let newAttributeValue = { ...parentAttribute };

        if (subAttributeName) {
          newAttributeValue[subAttributeName] = {
            ...(parentAttribute[subAttributeName] || {}),
            colors: {}, // Clear all colors in the nested object
          };
        } else {
          newAttributeValue.colors = {}; // Clear all colors directly
        }

        setAttributes({
          [attributeName]: newAttributeValue,
        });
      }}
    >
      {options.map((item) => {
        const itemRef = useRef(null); // Declare a ref for each item in the map
        const isOpen = openPickerKey === item.key;

        // Ensure beforeState and afterState are always objects
        const beforeState = item.before || {};
        const afterState = item.after || {};

        const hasAfterState = !!item.after; // Check if the 'after' object was originally provided
        const hasValue = checkHasValue(item);

        const beforePreviewStyle = getPreviewStyle(beforeState);
        const afterPreviewStyle = getPreviewStyle(afterState);

        // Get text colors for icons - use beforeState and afterState
        const beforeTextColor =
          beforeState.hasText === true ? getTextColor(beforeState) : "";
        const afterTextColor =
          afterState.hasText === true ? getTextColor(afterState) : "";

        // Determine if the preview circle for 'before' state should be visible
        const showBeforePreviewCircle =
          (beforeState.hasText && beforeState.textKey) ||
          (beforeState.hasBackground && beforeState.backgroundKey);

        // Determine if the preview circle for 'after' state should be visible
        const showAfterPreviewCircle =
          (afterState.hasText && afterState.hasText) || // Changed to afterState.hasText to match intent
          (afterState.hasBackground && afterState.backgroundKey);

        // A preview button should only show if there's at least one state with a configured preview
        const shouldShowPreviewButton =
          showBeforePreviewCircle || showAfterPreviewCircle;

        // A popover panel should only open if there's at least one state with a configured text or background
        const shouldShowPopoverPanel =
          beforeState.hasText ||
          beforeState.hasBackground ||
          afterState.hasText ||
          afterState.hasBackground;

        return (
          <WP_ToolsPanelItem
            key={item.key}
            label={item.label}
            hasValue={() => hasValue}
            onDeselect={() => {
              const parentAttribute = attributes[attributeName] || {};
              let targetObject = parentAttribute;
              let newAttributeValue = { ...parentAttribute };

              if (subAttributeName) {
                targetObject = parentAttribute[subAttributeName] || {};
                newAttributeValue[subAttributeName] = { ...targetObject };
              }

              const newColors = { ...(targetObject.colors || {}) };

              // Clear colors for 'before' state - pass the guaranteed beforeState and afterState
              clearColorKeys(beforeState, newColors);
              // Clear colors for 'after' state
              clearColorKeys(afterState, newColors);

              if (subAttributeName) {
                newAttributeValue[subAttributeName].colors = newColors;
              } else {
                newAttributeValue.colors = newColors;
              }

              setAttributes({
                [attributeName]: newAttributeValue,
              });
            }}
            isShownByDefault
          >
            <div
              className="color-control-item" // This wrapper div helps structure, Popover is anchored to the *button* inside it
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              {/* This is the actual clickable button/preview area for the Popover */}
              {shouldShowPreviewButton && (
                <div
                  ref={itemRef} // <--- Attach the ref here
                  role="button"
                  tabIndex={0}
                  onClick={(e) => setOpenPickerKey(isOpen ? null : item.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setOpenPickerKey(isOpen ? null : item.key);
                    }
                  }}
                  style={{
                    position: "relative",
                    width:
                      hasAfterState && showAfterPreviewCircle ? "40px" : "24px",
                    height: "24px",
                    cursor: "pointer",
                    marginRight: "10px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyItems: "center",
                    justifyContent: "center",
                  }}
                  className="appearance-btns"
                  aria-label={__("Open color settings for") + " " + item.label}
                >
                  {/* 1. After State Preview (Background/Lower Z-Index) */}
                  {hasAfterState && showAfterPreviewCircle && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        zIndex: 1,
                        ...afterPreviewStyle,
                      }}
                      title={__("Hover State")}
                    >
                      {/* Use afterState here for checks */}
                      {afterState.hasText === true &&
                        (afterState.hasBackground === true ||
                          afterState.hasGradient === true) && (
                          <span
                            className="appearance-icon"
                            style={{ fill: afterTextColor }}
                          >
                            {typography}
                          </span>
                        )}
                    </div>
                  )}

                  {/* 2. Before State Preview (Foreground/Higher Z-Index) */}
                  {showBeforePreviewCircle && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        zIndex: 2,
                        boxShadow:
                          hasAfterState && showAfterPreviewCircle
                            ? "2px 0 4px rgba(0,0,0,0.1)"
                            : "none",
                        ...beforePreviewStyle,
                      }}
                      title={__("Normal State")}
                    >
                      {/* Use beforeState here for checks */}
                      {beforeState.hasText === true &&
                        (beforeState.hasBackground === true ||
                          beforeState.hasGradient === true) && (
                          <span
                            className="appearance-icon"
                            style={{ fill: beforeTextColor }}
                          >
                            {typography}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder if no preview is available for any state */}
              {!shouldShowPreviewButton && (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1px dashed #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#999",
                    marginRight: "10px",
                  }}
                  title={__("No preview options")}
                >
                  ?
                </div>
              )}

              <span className="color-label" style={{ flexGrow: 1 }}>
                {item.label}
              </span>

              {isOpen &&
                shouldShowPopoverPanel && ( // Only show popover if there are options to configure
                  <Popover
                    placement="left-start"
                    offset={10}
                    onClose={() => {
                      setOpenPickerKey(null);
                    }}
                    //anchor={itemRef} // Anchor to the button's ref
                    className="component-color-popover"
                  >
                    <div style={{ width: "280px", padding: "16px" }}>
                      {/* Top Level Tabs: Color (Before) vs Hover (After) */}
                      <TabPanel
                        className="main-state-tabs"
                        activeClass="is-active"
                        tabs={[
                          // Check beforeState and afterState for existence of text/background options
                          beforeState.hasText || beforeState.hasBackground
                            ? { name: "before", title: __("Color") }
                            : null,
                          hasAfterState &&
                          (afterState.hasText || afterState.hasBackground)
                            ? { name: "after", title: __("Hover") }
                            : null,
                        ].filter(Boolean)}
                      >
                        {(tab) => {
                          const isAfterTab = tab.name === "after";
                          const currentState = isAfterTab
                            ? afterState // Use the guaranteed object
                            : beforeState; // Use the guaranteed object

                          // Determine rendering strategy based on currentState properties
                          const hasTextOption =
                            currentState?.hasText && currentState?.textKey;
                          const hasBackgroundOption =
                            currentState?.hasBackground &&
                            currentState?.backgroundKey;
                          const hasBoth = hasTextOption && hasBackgroundOption;
                          const hasOnlyText =
                            hasTextOption && !hasBackgroundOption;
                          const hasOnlyBackground =
                            hasBackgroundOption && !hasTextOption;

                          return (
                            <div style={{ marginTop: "16px" }}>
                              {hasOnlyText && ( // Render text control standalone if only text exists for this state
                                <div style={{ marginBottom: "16px" }}>
                                  <strong>{__("Text Color")}</strong>
                                  <SingleColorControl
                                    label={__("Text Color")}
                                    itemKey={currentState.textKey}
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                    attributeName={attributeName}
                                    subAttributeName={subAttributeName}
                                    themeColors={themeColors}
                                    themeGradients={themeGradients}
                                    hasColor={true}
                                    hasGradient={false} // Text typically doesn't have gradients unless explicitly configured
                                  />
                                </div>
                              )}

                              {hasOnlyBackground && ( // Render background control standalone if only background exists for this state
                                <div style={{ marginBottom: "16px" }}>
                                  <strong>{__("Background")}</strong>
                                  <SingleColorControl
                                    label={__("Background")}
                                    itemKey={currentState.backgroundKey}
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                    attributeName={attributeName}
                                    subAttributeName={subAttributeName}
                                    themeColors={themeColors}
                                    themeGradients={themeGradients}
                                    hasColor={true}
                                    hasGradient={
                                      currentState.hasBackgroundGradient
                                    }
                                  />
                                </div>
                              )}

                              {hasBoth && ( // If both text and background, use the inner TabPanel
                                <TabPanel
                                  className="text-background-tabs"
                                  activeClass="is-active"
                                  tabs={[
                                    { name: "text", title: __("Text") },
                                    {
                                      name: "background",
                                      title: __("Background"),
                                    },
                                  ]}
                                >
                                  {(innerTab) => {
                                    const isTextTab = innerTab.name === "text";
                                    const currentKey = isTextTab
                                      ? currentState.textKey
                                      : currentState.backgroundKey;
                                    const currentLabel = isTextTab
                                      ? __("Text Color")
                                      : __("Background");
                                    // Text typically doesn't have gradients; background does based on config
                                    const currentHasGradient = isTextTab
                                      ? false
                                      : currentState.hasBackgroundGradient;

                                    return (
                                      <div style={{ marginTop: "16px" }}>
                                        <SingleColorControl
                                          label={currentLabel}
                                          itemKey={currentKey}
                                          attributes={attributes}
                                          setAttributes={setAttributes}
                                          attributeName={attributeName}
                                          subAttributeName={subAttributeName}
                                          themeColors={themeColors}
                                          themeGradients={themeGradients}
                                          hasColor={true}
                                          hasGradient={currentHasGradient}
                                        />
                                      </div>
                                    );
                                  }}
                                </TabPanel>
                              )}

                              {!hasTextOption && !hasBackgroundOption && (
                                <p>
                                  {__(
                                    "No color options available for this state."
                                  )}
                                </p>
                              )}
                            </div>
                          );
                        }}
                      </TabPanel>
                    </div>
                  </Popover>
                )}
            </div>
          </WP_ToolsPanelItem>
        );
      })}
    </WP_ToolsPanel>
  );
};

export { AppearanceComponent };
