import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
  Button,
  ToolsPanel,
  ToolsPanelItem,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem,
  __experimentalUnitControl as UnitControl,
  Tooltip,
  Flex,
  FlexItem,
  FlexBlock,
  RangeControl,
} from "@wordpress/components";

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

const SIDES = ["top", "right", "bottom", "left"];

const PaddingComponent = ({
  title = "Padding",
  // Ensure this matches your block.json structure (e.g., "icon" or "style")
  attributeName = "style",
  subAttributeName, // <--- Add this new prop
  attributes,
  setAttributes,
}) => {
  const [activeSide, setActiveSide] = useState("top");

  // Helper to get the correct padding object based on subAttributeName
  const getPaddingObject = () => {
    if (
      subAttributeName &&
      attributes[attributeName]?.[subAttributeName]?.padding
    ) {
      return attributes[attributeName][subAttributeName].padding;
    }
    return attributes[attributeName]?.padding || {};
  };

  const isLinked = getPaddingObject().linked !== false;

  const getSideValue = (side) => {
    const padding = getPaddingObject();
    return padding[side];
  };

  const getCurrentSide = () => (isLinked ? "top" : activeSide);

  const getPaddingValue = () => {
    const side = getCurrentSide();
    return getSideValue(side);
  };

  const updatePadding = (value, targetSide = null) => {
    const parent = attributes[attributeName] || {};
    let targetContainer = parent; // Where 'padding' will directly reside or be created under

    // If subAttributeName is provided, work with the nested object
    if (subAttributeName) {
      if (!parent[subAttributeName]) {
        parent[subAttributeName] = {}; // Initialize if it doesn't exist
      }
      targetContainer = parent[subAttributeName];
    }

    const currentPadding = targetContainer.padding || {};
    const newPadding = { ...currentPadding };

    // Safety: If UnitControl returns undefined, don't set it
    if (value === undefined) return;

    const sidesToUpdate = targetSide
      ? [targetSide]
      : isLinked
      ? SIDES
      : [activeSide];

    sidesToUpdate.forEach((side) => {
      newPadding[side] = value;
    });

    // Reconstruct the attribute based on whether subAttributeName was used
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent, // Keep other properties of the main attribute
          [subAttributeName]: {
            ...targetContainer, // Keep other properties of the sub-attribute
            padding: newPadding,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: { ...parent, padding: newPadding },
      });
    }
  };

  const toggleLinked = () => {
    const parent = attributes[attributeName] || {};
    let targetContainer = parent; // Where 'padding' will directly reside or be created under

    if (subAttributeName) {
      if (!parent[subAttributeName]) {
        parent[subAttributeName] = {};
      }
      targetContainer = parent[subAttributeName];
    }

    const currentPadding = targetContainer.padding || {};
    const wasLinked = currentPadding.linked !== false;
    const newPadding = { ...currentPadding, linked: !wasLinked };

    if (wasLinked === false) {
      // When re-linking, sync all sides to the top value
      const source = newPadding.top;
      SIDES.forEach((side) => {
        newPadding[side] = source;
      });
    }

    // Reconstruct the attribute
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent,
          [subAttributeName]: {
            ...targetContainer,
            padding: newPadding,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: { ...parent, padding: newPadding },
      });
    }
  };

  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  const currentValue = getPaddingValue();
  const hasValue = currentValue !== undefined && currentValue !== "";

  // --- FIX START: Improved Parser ---
  const parseValue = (valStr) => {
    // 1. Handle empty/undefined explicitly to prevent "undefined" string units
    if (valStr === undefined || valStr === null || valStr === "") {
      return { value: 0, unit: "px" };
    }

    const val = parseFloat(valStr);

    // 2. Robust unit extraction
    // If val is "10", replace leaves empty string -> default to "px"
    // If val is "10%", replace leaves "%"
    const unit = String(valStr).replace(String(val), "") || "px";

    return {
      value: isNaN(val) ? 0 : val,
      unit: unit,
    };
  };
  // --- FIX END ---

  const { value: numericValue, unit: currentUnit } = parseValue(currentValue);

  const renderSideControl = (side) => {
    const value = getSideValue(side);
    const isVertical = side === "top" || side === "bottom";

    return (
      <div
        style={{
          zIndex: 1,
          gridArea: side,
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UnitControl
          size="__unstable-small"
          value={value}
          onChange={(val) => updatePadding(val, side)}
          onFocus={() => setActiveSide(side)}
          aria-label={`${side} padding`}
          style={{
            textAlign: "center",
            backgroundColor: "#fff",
            width: isVertical ? "92px" : "68px",
            boxShadow:
              activeSide === side
                ? `0 0 0 1px var(--wp-admin-theme-color)`
                : "none",
          }}
        />
      </div>
    );
  };

  return (
    <WP_ToolsPanel
      label={title}
      className="padding-control-panel"
      resetAll={() => {
        const parent = attributes[attributeName] || {};
        let newAttributeValue = { ...parent };

        if (subAttributeName) {
          // Ensure subAttributeName exists before trying to modify its padding
          newAttributeValue[subAttributeName] = {
            ...(parent[subAttributeName] || {}),
            padding: {},
          };
        } else {
          newAttributeValue.padding = {};
        }

        setAttributes({
          [attributeName]: newAttributeValue,
        });
      }}
    >
      <WP_ToolsPanelItem
        label={__("Padding")}
        hasValue={() => hasValue}
        onDeselect={() => {
          const parent = attributes[attributeName] || {};
          let newAttributeValue = { ...parent }; // Copy for modification

          if (subAttributeName) {
            newAttributeValue[subAttributeName] = {
              ...(parent[subAttributeName] || {}),
              padding: {},
            };
          } else {
            newAttributeValue.padding = {};
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
          {isLinked ? (
            <FlexBlock>
              <Flex gap={2}>
                <FlexItem style={{ maxWidth: "70px" }}>
                  <UnitControl
                    value={currentValue}
                    onChange={(val) => updatePadding(val)}
                  />
                </FlexItem>
                <FlexBlock>
                  <RangeControl
                    value={numericValue}
                    min={0}
                    max={100}
                    withInputField={false}
                    // FIX: Ensure we don't append "undefined" if unit is somehow broken
                    onChange={(val) => updatePadding(`${val}${currentUnit}`)}
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
                border: "1px dashed #ccc",
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

export { PaddingComponent };
