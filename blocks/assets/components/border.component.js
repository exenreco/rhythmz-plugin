import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
  Button,
  Popover,
  ToolsPanel,
  ToolsPanelItem,
  ColorPalette,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem,
  __experimentalUnitControl as UnitControl,
  SelectControl,
  Tooltip,
  Flex,
  FlexItem,
  FlexBlock,
  RangeControl,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";

// --- Icons ---
const IconLink = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.6 7.2H14v1.5h1.6c2 0 3.7 1.7 3.7 3.7s-1.7 3.7-3.7 3.7H14v1.5h1.6c2.8 0 5.2-2.3 5.2-5.2 0-2.9-2.3-5.2-5.2-5.2zM4.7 12.4c0-2 1.7-3.7 3.7-3.7H10V7.2H8.4c-2.9 0-5.2 2.3-5.2 5.2 0 2.9 2.3 5.2 5.2 5.2H10v-1.5H8.4c-2 0-3.7-1.7-3.7-3.7zm4.6.9h5.3v-1.5H9.3v1.5z" />
  </svg>
);
const IconUnlink = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.6 7.2H14v1.5h1.6c2 0 3.7 1.7 3.7 3.7s-1.7 3.7-3.7 3.7H14v1.5h1.6c2.8 0 5.2-2.3 5.2-5.2 0-2.9-2.3-5.2-5.2-5.2zM4.7 12.4c0-2 1.7-3.7 3.7-3.7H10V7.2H8.4c-2.9 0-5.2 2.3-5.2 5.2 0 2.9 2.3 5.2 5.2 5.2H10v-1.5H8.4c-2 0-3.7-1.7-3.7-3.7z" />
  </svg>
);

const BORDER_STYLES = [
  { label: __("Solid"), value: "solid" },
  { label: __("Dashed"), value: "dashed" },
  { label: __("Dotted"), value: "dotted" },
  { label: __("None"), value: "none" },
];

const SIDES = ["top", "right", "bottom", "left"];

const getBorderStyleCss = (style, color, width = "1px") => {
  const s = style || "solid";
  const c = color || "#ddd";
  if (s === "none") return `1px dashed #eee`;
  return `${width} ${s} ${c}`;
};

const BorderComponent = ({
  title = "Borders",
  attributeName = "style",
  subAttributeName, // <--- Add this new prop
  attributes,
  setAttributes,
}) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [popoverSide, setPopoverSide] = useState(null);
  const [activeSide, setActiveSide] = useState("top");

  const { themeColors } = useSelect((select) => {
    const settings = select("core/block-editor").getSettings();
    return { themeColors: settings.colors || [] };
  }, []);

  // Helper to get the correct borders object based on subAttributeName
  const getBordersObject = () => {
    if (
      subAttributeName &&
      attributes[attributeName]?.[subAttributeName]?.borders
    ) {
      return attributes[attributeName][subAttributeName].borders;
    }
    return attributes[attributeName]?.borders || {};
  };

  const isLinked = getBordersObject().linked !== false;

  const getSideValue = (side, prop) => {
    const borders = getBordersObject(); // Use the helper
    return borders[side]?.[prop];
  };

  const getCurrentSide = () => (isLinked ? "top" : activeSide);

  const getBorderValue = (prop) => {
    const side = getCurrentSide();
    return getSideValue(side, prop);
  };

  const updateBorder = (prop, value, targetSide = null) => {
    const parent = attributes[attributeName] || {};
    let targetContainer = parent; // This will be where 'borders' directly lives or will be created under

    // If subAttributeName is provided, we need to operate on a nested object
    if (subAttributeName) {
      // Ensure the subAttributeName object exists within parentObj
      if (!parent[subAttributeName]) {
        parent[subAttributeName] = {};
      }
      targetContainer = parent[subAttributeName];
    }

    const currentBorders = targetContainer.borders || {};
    // Deep clone to avoid mutating nested objects directly
    const newBorders = JSON.parse(JSON.stringify(currentBorders));

    const sidesToUpdate = targetSide
      ? [targetSide]
      : isLinked
      ? SIDES
      : [activeSide];

    sidesToUpdate.forEach((side) => {
      const sideObj = newBorders[side] || {};
      sideObj[prop] = value;

      // Ensure default styles/widths when a related property is set
      if (prop === "width" && value && !sideObj.style) {
        sideObj.style = "solid";
      }
      if (prop === "style" && value !== "none" && !sideObj.width) {
        sideObj.width = "1px";
      }
      if (prop === "color" && value && !sideObj.style) {
        sideObj.style = "solid";
        if (!sideObj.width) sideObj.width = "1px";
      }

      newBorders[side] = sideObj;
    });

    // Now, reconstruct the attribute based on whether subAttributeName was used
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent, // Keep other properties of the main attribute
          [subAttributeName]: {
            ...targetContainer, // Keep other properties of the sub-attribute
            borders: newBorders,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: {
          ...parent, // Keep other properties of the main attribute
          borders: newBorders,
        },
      });
    }
  };

  const toggleLinked = () => {
    const parent = attributes[attributeName] || {};
    let targetContainer = parent;

    if (subAttributeName) {
      if (!parent[subAttributeName]) {
        parent[subAttributeName] = {};
      }
      targetContainer = parent[subAttributeName];
    }

    const currentBorders = targetContainer.borders || {};
    const wasLinked = currentBorders.linked !== false;
    const newBorders = { ...currentBorders, linked: !wasLinked };

    if (wasLinked === false) {
      // When re-linking, sync all sides to the top value
      const source = newBorders.top || {};
      SIDES.forEach((side) => {
        newBorders[side] = { ...source }; // Copy the top border object
      });
    }

    // Reconstruct the attribute
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent,
          [subAttributeName]: {
            ...targetContainer,
            borders: newBorders,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: { ...parent, borders: newBorders },
      });
    }
  };

  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  const currentWidth = getBorderValue("width");
  const currentStyle = getBorderValue("style") || "solid";
  const currentColor = getBorderValue("color");

  const hasValue =
    !!currentWidth ||
    !!currentColor ||
    (currentStyle !== "none" && currentStyle !== undefined);

  // --- FIXED PARSING LOGIC ---
  const parseWidth = (widthStr) => {
    const str = String(widthStr || "");
    // Use Regex to separate number from unit
    const match = str.match(/^([\d.]+)(.*)$/);

    if (match) {
      const val = parseFloat(match[1]);
      return {
        value: isNaN(val) ? 0 : val,
        unit: match[2] || "px",
      };
    }
    return { value: 0, unit: "px" };
  };

  const { value: numericWidth, unit: widthUnit } = parseWidth(currentWidth);

  const renderSideControl = (side) => {
    const style = getSideValue(side, "style");
    const color = getSideValue(side, "color");
    const width = getSideValue(side, "width");
    const isVertical = side === "top" || side === "bottom";

    const isPopoverOpen = popoverSide === side;
    let popoverPlacement = "bottom center";
    if (side === "right") popoverPlacement = "bottom right";
    else if (side === "left") popoverPlacement = "bottom left";

    return (
      <div
        style={{
          gridArea: side,
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            zIndex: 1,
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ order: 0 }}>
            <Flex flexDirection="row">
              <FlexItem>
                <Button
                  onClick={() => setPopoverSide(isPopoverOpen ? null : side)}
                  aria-label={__(`${side} border style`)}
                  aria-expanded={isPopoverOpen}
                  style={{
                    width: "24px",
                    height: "24px",
                    padding: 0,
                    minWidth: "unset",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    style={{
                      padding: "4px",
                      border: "1px solid #757575",
                      borderRadius: "2px",
                      height: "32px",
                      width: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: `2px ${style || "solid"} ${
                          color || "transparent"
                        }`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: color || "#ddd",
                        }}
                      />
                    </div>
                  </Button>
                </Button>
              </FlexItem>
            </Flex>

            {isPopoverOpen && (
              <Popover
                position={popoverPlacement}
                onClose={() => setPopoverSide(null)}
                className="border-control-popover"
              >
                <div style={{ width: "240px", padding: "16px" }}>
                  <h4
                    style={{
                      margin: "0 0 12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: "#757575",
                    }}
                  >
                    {`${side} ${__("Border")}`}
                  </h4>
                  <ColorPalette
                    colors={themeColors}
                    value={color}
                    onChange={(val) => updateBorder("color", val, side)}
                    clearable
                  />
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <SelectControl
                      label={__("Style")}
                      value={style}
                      options={BORDER_STYLES}
                      onChange={(val) => updateBorder("style", val, side)}
                      size="__unstable-large"
                    />
                  </div>
                </div>
              </Popover>
            )}
          </div>

          <div style={{ order: 1 }}>
            <UnitControl
              size="__unstable-small"
              value={width}
              onChange={(val) => updateBorder("width", val, side)}
              onFocus={() => {
                setActiveSide(side);
                setPopoverSide(null);
              }}
              aria-label={`${side} border width`}
              style={{
                textAlign: "center",
                backgroundColor: "#fff",
                width: isVertical ? "60px" : "50px",
                boxShadow:
                  activeSide === side
                    ? `0 0 0 1px var(--wp-admin-theme-color)`
                    : "none",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <WP_ToolsPanel
      label={title}
      className="border-control-panel"
      resetAll={() => {
        const parent = attributes[attributeName] || {};
        let newAttributeValue = { ...parent };

        if (subAttributeName) {
          newAttributeValue[subAttributeName] = {
            ...(parent[subAttributeName] || {}),
            borders: {},
          };
        } else {
          newAttributeValue.borders = {};
        }

        setAttributes({
          [attributeName]: newAttributeValue,
        });
      }}
    >
      <WP_ToolsPanelItem
        label={__("Border")}
        hasValue={() => hasValue}
        onDeselect={() => {
          const parent = attributes[attributeName] || {};
          let newAttributeValue = { ...parent };

          if (subAttributeName) {
            newAttributeValue[subAttributeName] = {
              ...(parent[subAttributeName] || {}),
              borders: {},
            };
          } else {
            newAttributeValue.borders = {};
          }

          setAttributes({
            [attributeName]: newAttributeValue,
          });
        }}
        isShownByDefault
      >
        <Flex
          gap={2}
          align="center"
          justifyContent="flex-start"
          style={{ marginBottom: "12px" }}
        >
          {isLinked && (
            <FlexItem>
              <Button
                onClick={() => setIsMainOpen(!isMainOpen)}
                aria-expanded={isMainOpen}
                aria-label={__("Border Color and Style")}
                style={{
                  padding: "4px",
                  border: "1px solid #757575",
                  borderRadius: "2px",
                  height: "32px",
                  width: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px ${currentStyle || "solid"} ${
                      currentColor || "transparent"
                    }`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: currentColor || "#ddd",
                    }}
                  />
                </div>
              </Button>

              {isMainOpen && (
                <Popover
                  position="bottom left"
                  onClose={() => setIsMainOpen(false)}
                  className="border-control-popover"
                >
                  <div style={{ width: "260px", padding: "16px" }}>
                    <h4
                      style={{
                        margin: "0 0 12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        color: "#757575",
                      }}
                    >
                      {__("Border Settings")}
                    </h4>
                    <ColorPalette
                      colors={themeColors}
                      value={currentColor}
                      onChange={(val) => updateBorder("color", val)}
                      clearable
                    />
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <SelectControl
                        label={__("Border Style")}
                        value={currentStyle}
                        options={BORDER_STYLES}
                        onChange={(val) => updateBorder("style", val)}
                        size="__unstable-large"
                      />
                    </div>
                  </div>
                </Popover>
              )}
            </FlexItem>
          )}

          {isLinked ? (
            <FlexBlock>
              <Flex gap={2}>
                <FlexItem style={{ maxWidth: "70px" }}>
                  <UnitControl
                    value={currentWidth}
                    onChange={(val) => updateBorder("width", val)}
                  />
                </FlexItem>
                <FlexBlock>
                  <RangeControl
                    value={numericWidth}
                    min={0}
                    max={50}
                    withInputField={false}
                    onChange={(val) =>
                      updateBorder("width", `${val}${widthUnit}`)
                    }
                    style={{ margin: 0 }}
                  />
                </FlexBlock>
              </Flex>
            </FlexBlock>
          ) : (
            <FlexBlock>
              <span
                style={{ fontSize: "13px", color: "#1e1e1e", fontWeight: 500 }}
              >
                {__("Configure sides")}
              </span>
            </FlexBlock>
          )}

          <FlexItem>
            <Tooltip text={isLinked ? __("Unlink sides") : __("Link sides")}>
              <Button
                variant={isLinked ? "primary" : "secondary"}
                icon={isLinked ? IconLink : IconUnlink}
                onClick={toggleLinked}
                size="small"
                style={{ height: "32px", minWidth: "32px" }}
              />
            </Tooltip>
          </FlexItem>
        </Flex>

        {!isLinked && (
          <div
            style={{
              position: "relative",
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 80px 1fr",
              gridTemplateRows: "auto 80px auto",
              gridTemplateAreas: `
                ". top ."
                "left center right"
                ". bottom ."
              `,
              gap: "0px",
              alignItems: "stretch",
              justifyItems: "stretch",
              width: "100%",
              height: "20em",
            }}
          >
            {renderSideControl("top")}
            {renderSideControl("left")}

            <div
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                gridArea: "center",
                width: "13em",
                height: "13.2em",
                background: "#fff",
                color: "#1e1e1e",
                borderRadius: "2px",
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderTop: getBorderStyleCss(
                  getSideValue("top", "style"),
                  getSideValue("top", "color"),
                  "2px"
                ),
                borderRight: getBorderStyleCss(
                  getSideValue("right", "style"),
                  getSideValue("right", "color"),
                  "2px"
                ),
                borderBottom: getBorderStyleCss(
                  getSideValue("bottom", "style"),
                  getSideValue("bottom", "color"),
                  "2px"
                ),
                borderLeft: getBorderStyleCss(
                  getSideValue("left", "style"),
                  getSideValue("left", "color"),
                  "2px"
                ),
              }}
            >
              <IconUnlink />
            </div>

            {renderSideControl("right")}
            {renderSideControl("bottom")}
          </div>
        )}
      </WP_ToolsPanelItem>
    </WP_ToolsPanel>
  );
};

export { BorderComponent };
