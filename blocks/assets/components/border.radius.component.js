import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element"; // Don't forget useState!
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

// Corner specific icons for the visualizer
const IconCornerTopLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18V6h12v1.5H7.5V18H6z" />
  </svg>
);
const IconCornerTopRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 18V6H6v1.5h10.5V18H18z" />
  </svg>
);
const IconCornerBottomRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6v12H6v-1.5h10.5V6H18z" />
  </svg>
);
const IconCornerBottomLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6v12h12v-1.5H7.5V6H6z" />
  </svg>
);

const CORNERS = ["topLeft", "topRight", "bottomRight", "bottomLeft"];

const BorderRadiusComponent = ({
  title = "Border Radius",
  attributeName = "style",
  subAttributeName, // <--- Add this new prop
  attributes,
  setAttributes,
}) => {
  // Use useState to manage component state (e.g., linked state, active corner)
  // although it's not explicitly used in this snippet's state management,
  // it's good practice to import if you might add it later.
  // The 'activeSide' in previous components is similar to what could be here.
  // For now, we'll keep it simple as the original component didn't use `useState` for linked/active,
  // but rather derived it from props and internal logic.
  // We'll add `useState` to this component for consistency with the others.
  const [activeCorner, setActiveCorner] = useState("topLeft"); // Example state

  // Helper to get the correct radius object based on subAttributeName
  const getRadiusObject = () => {
    if (
      subAttributeName &&
      attributes[attributeName]?.[subAttributeName]?.radius
    ) {
      return attributes[attributeName][subAttributeName].radius;
    }
    return attributes[attributeName]?.radius || {};
  };

  const isLinked = getRadiusObject().linked !== false;

  const getCornerValue = (corner) => {
    const radius = getRadiusObject(); // Use the helper
    return radius[corner];
  };

  const getCommonValue = () => {
    const radius = getRadiusObject(); // Use the helper
    return (
      radius.topLeft ||
      radius.topRight ||
      radius.bottomRight ||
      radius.bottomLeft ||
      ""
    );
  };

  const updateRadius = (value, targetCorner = null) => {
    const parent = attributes[attributeName] || {};
    let targetContainer = parent; // Where 'radius' will directly live or be created under

    // If subAttributeName is provided, we need to operate on a nested object
    if (subAttributeName) {
      // Ensure the subAttributeName object exists within parentObj
      if (!parent[subAttributeName]) {
        parent[subAttributeName] = {};
      }
      targetContainer = parent[subAttributeName];
    }

    const currentRadius = targetContainer.radius || {};
    const newRadius = { ...currentRadius };

    const cornersToUpdate = targetCorner ? [targetCorner] : CORNERS;

    cornersToUpdate.forEach((corner) => {
      newRadius[corner] = value;
    });

    // Now, reconstruct the attribute based on whether subAttributeName was used
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent, // Keep other properties of the main attribute
          [subAttributeName]: {
            ...targetContainer, // Keep other properties of the sub-attribute
            radius: newRadius,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: {
          ...parent, // Keep other properties of the main attribute
          radius: newRadius,
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

    const currentRadius = targetContainer.radius || {};
    const wasLinked = currentRadius.linked !== false;

    const newRadius = { ...currentRadius, linked: !wasLinked };

    if (wasLinked === false) {
      // Switching TO linked: sync all values to the top-left value
      const sourceVal = newRadius.topLeft;
      CORNERS.forEach((corner) => {
        newRadius[corner] = sourceVal;
      });
    }

    // Reconstruct the attribute
    if (subAttributeName) {
      setAttributes({
        [attributeName]: {
          ...parent,
          [subAttributeName]: {
            ...targetContainer,
            radius: newRadius,
          },
        },
      });
    } else {
      setAttributes({
        [attributeName]: { ...parent, radius: newRadius },
      });
    }
  };

  const WP_ToolsPanel = __experimentalToolsPanel || ToolsPanel;
  const WP_ToolsPanelItem = __experimentalToolsPanelItem || ToolsPanelItem;

  const currentCommonValue = getCommonValue();
  const hasValue = CORNERS.some((c) => !!getCornerValue(c));

  const parseWidth = (widthStr) => {
    // 1. Check if the value exists
    if (widthStr === undefined || widthStr === null || widthStr === "") {
      return { value: 0, unit: "px" };
    }

    const val = parseFloat(widthStr);

    // 2. Check if the parsed value is a number
    if (isNaN(val)) {
      return { value: 0, unit: "px" };
    }

    // 3. Extract unit
    const unit = String(widthStr).replace(String(val), "") || "px";

    return {
      value: val,
      unit: unit,
    };
  };

  const { value: numericValue, unit: commonUnit } =
    parseWidth(currentCommonValue);

  // Helper to get CSS value for the visualizer center box
  const getVisualizerStyle = () => {
    const r = getRadiusObject(); // Use the helper
    if (isLinked) {
      const val = currentCommonValue || "0px";
      return { borderRadius: val };
    }
    return {
      borderTopLeftRadius: r.topLeft || "0px",
      borderTopRightRadius: r.topRight || "0px",
      borderBottomRightRadius: r.bottomRight || "0px",
      borderBottomLeftRadius: r.bottomLeft || "0px",
    };
  };

  // --- Render Helper for Visualizer Corner Controls ---
  const renderCornerControl = (corner) => {
    const value = getCornerValue(corner);

    // Determine Icon based on corner
    let Icon = IconCornerTopLeft;
    if (corner === "topRight") Icon = IconCornerTopRight;
    if (corner === "bottomRight") Icon = IconCornerBottomRight;
    if (corner === "bottomLeft") Icon = IconCornerBottomLeft;

    return (
      <div
        style={{
          gridArea: corner,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          width: "100%",
          height: "100%",
          padding: "8px",
        }}
      >
        {/* Icon Label */}
        <div
          style={{ color: "#757575", marginBottom: "2px" }}
          title={__(`${corner} radius`)}
        >
          <Icon />
        </div>

        {/* Input */}
        <UnitControl
          size="__unstable-small"
          value={value}
          onChange={(val) => {
            updateRadius(val, corner);
            setActiveCorner(corner); // Keep track of active corner
          }}
          aria-label={`${corner} border radius`}
          style={{
            textAlign: "center",
            backgroundColor: "#fff",
            width: "60px",
            boxShadow:
              activeCorner === corner
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
      className="border-radius-control-panel"
      resetAll={() => {
        const parent = attributes[attributeName] || {};
        let newAttributeValue = { ...parent };

        if (subAttributeName) {
          newAttributeValue[subAttributeName] = {
            ...(parent[subAttributeName] || {}),
            radius: {},
          };
        } else {
          newAttributeValue.radius = {};
        }

        setAttributes({
          [attributeName]: newAttributeValue,
        });
      }}
    >
      <WP_ToolsPanelItem
        label={__("Radius")}
        hasValue={() => hasValue}
        onDeselect={() => {
          const parent = attributes[attributeName] || {};
          let newAttributeValue = { ...parent };

          if (subAttributeName) {
            newAttributeValue[subAttributeName] = {
              ...(parent[subAttributeName] || {}),
              radius: {},
            };
          } else {
            newAttributeValue.radius = {};
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
          {/* Linked Mode: Slider + Input */}
          {isLinked ? (
            <FlexBlock>
              <Flex gap={2}>
                <FlexItem style={{ maxWidth: "70px" }}>
                  <UnitControl
                    value={currentCommonValue}
                    onChange={(val) => updateRadius(val)}
                  />
                </FlexItem>
                <FlexBlock>
                  <RangeControl
                    value={numericValue}
                    min={0}
                    max={100}
                    withInputField={false}
                    onChange={(val) => updateRadius(`${val}${commonUnit}`)}
                    style={{ margin: 0 }}
                  />
                </FlexBlock>
              </Flex>
            </FlexBlock>
          ) : (
            // Unlinked Header
            <FlexBlock>
              <span
                style={{ fontSize: "13px", color: "#1e1e1e", fontWeight: 500 }}
              >
                {__("Configure corners")}
              </span>
            </FlexBlock>
          )}

          {/* Link Toggle */}
          <FlexItem>
            <Tooltip
              text={isLinked ? __("Unlink corners") : __("Link corners")}
            >
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

        {/* 
           --- VISUALIZER (UNLINKED) --- 
        */}
        {!isLinked && (
          <div
            style={{
              position: "relative",
              marginTop: "16px",
              display: "grid",
              // Columns: [Left Controls] [Center Box] [Right Controls]
              gridTemplateColumns: "1fr 100px 1fr",
              // Rows: [Top Controls] [Center Box] [Bottom Controls]
              gridTemplateRows: "auto 100px auto",
              gridTemplateAreas: `
                "topLeft . topRight"
                ". center ."
                "bottomLeft . bottomRight"
              `,
              gap: "0px",
              alignItems: "stretch",
              justifyItems: "stretch",
              width: "100%",
              height: "18em",
            }}
          >
            {/* Top Left */}
            {renderCornerControl("topLeft")}

            {/* Top Right */}
            {renderCornerControl("topRight")}

            {/* CENTER BOX (PREVIEW) */}
            <div
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                gridArea: "center",
                width: "10em",
                height: "10em",
                background: "#fff",
                color: "#1e1e1e",
                // Base border to make the radius visible
                border: "2px solid #1e1e1e",
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // Apply dynamic radius
                ...getVisualizerStyle(),
              }}
            >
              <IconUnlink />
            </div>

            {/* Bottom Left */}
            {renderCornerControl("bottomLeft")}

            {/* Bottom Right */}
            {renderCornerControl("bottomRight")}
          </div>
        )}
      </WP_ToolsPanelItem>
    </WP_ToolsPanel>
  );
};

export { BorderRadiusComponent };
