import {
  RangeControl,
  UnitControl,
  __experimentalUnitControl,
  ToolsPanel,
  ToolsPanelItem,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem,
  Flex,
  FlexItem,
} from "@wordpress/components";

// --- Main Component ---
const UnitComponent = ({
  title = "Dimensions",
  options = [],
  attributeName = "dimensions",
  subAttributeName = null,
  attributes,
  setAttributes,
}) => {
  const WP_ToolsPanel = ToolsPanel || __experimentalToolsPanel;
  const WP_ToolsPanelItem = ToolsPanelItem || __experimentalToolsPanelItem;
  const WP_UnitControl = UnitControl || __experimentalUnitControl;

  const WP_Flex =
    Flex ||
    (({ children, className, style }) => (
      <div className={className} style={{ display: "flex", ...style }}>
        {children}
      </div>
    ));
  const WP_FlexItem =
    FlexItem || (({ children, style }) => <div style={style}>{children}</div>);

  if (!WP_ToolsPanel || !WP_ToolsPanelItem) {
    console.warn("ToolsPanel components missing.");
    return null;
  }

  const isNested = !!subAttributeName;

  const getValue = (key) => {
    const parent = attributes[attributeName];
    if (isNested) {
      // Safety check: ensure parent[subAttributeName] is actually an object
      const sub = parent?.[subAttributeName];
      return typeof sub === "object" && sub !== null ? sub[key] : undefined;
    }
    return parent?.[key];
  };

  // --- FIX 1: Safe Update Logic ---
  const updateValue = (key, value) => {
    // 1. Safely clone parent
    // Ensure parent is an object before spreading. If it's a string/null, start fresh.
    let parentObj =
      attributes[attributeName] && typeof attributes[attributeName] === "object"
        ? { ...attributes[attributeName] }
        : {};

    if (isNested) {
      // 2. Safely clone nested object
      // If the current value is "auto" (string), we force it to an empty object {}
      // before setting the new key.
      let nestedObj = {};

      const currentSubVal = parentObj[subAttributeName];
      if (
        currentSubVal &&
        typeof currentSubVal === "object" &&
        !Array.isArray(currentSubVal)
      ) {
        nestedObj = { ...currentSubVal };
      }

      if (value === undefined || value === null || value === "") {
        delete nestedObj[key];
      } else {
        nestedObj[key] = value;
      }

      parentObj[subAttributeName] = nestedObj;
    } else {
      if (value === undefined || value === null || value === "") {
        delete parentObj[key];
      } else {
        parentObj[key] = value;
      }
    }

    setAttributes({
      [attributeName]: parentObj,
    });
  };

  const checkHasValue = (key) => {
    const val = getValue(key);
    return val !== undefined && val !== null && val !== "";
  };

  const resetItem = (key) => {
    updateValue(key, undefined);
  };

  const resetAll = () => {
    // Safely clone parent
    const parentObj =
      attributes[attributeName] && typeof attributes[attributeName] === "object"
        ? { ...attributes[attributeName] }
        : {};

    if (isNested) {
      parentObj[subAttributeName] = {};
    } else {
      options.forEach((opt) => {
        delete parentObj[opt.key];
      });
    }

    setAttributes({
      [attributeName]: parentObj,
    });
  };

  // --- FIX 2: Handle "auto" in parsing ---
  const parseQuantityAndUnit = (rawValue) => {
    if (!rawValue) return { num: 0, unit: "px" };

    // If the value is a keyword like "auto", return 0 and a default unit (px)
    // so the slider has a valid starting point if moved.
    if (typeof rawValue === "string" && isNaN(parseFloat(rawValue))) {
      return { num: 0, unit: "px" };
    }

    const num = parseFloat(rawValue);
    const unit = String(rawValue).replace(num, "") || "px";
    return {
      num: isNaN(num) ? 0 : num,
      unit,
    };
  };

  return (
    <WP_ToolsPanel
      label={title}
      className="unit-block-tools-panel"
      resetAll={resetAll}
    >
      {options.map((item) => {
        const fullValue = getValue(item.key);
        const { num, unit } = parseQuantityAndUnit(fullValue);
        const hasValue = checkHasValue(item.key);

        return (
          <WP_ToolsPanelItem
            key={item.key}
            label={item.label}
            hasValue={() => hasValue}
            onDeselect={() => resetItem(item.key)}
            isShownByDefault={item.isShownByDefault}
          >
            <div
              className="unit-control-wrapper"
              style={{ marginBottom: "16px" }}
            >
              <div
                style={{ marginBottom: "8px", fontWeight: 500 }}
                className="components-base-control__label"
              >
                {item.label}
              </div>

              <WP_Flex gap={2} align="flex-end">
                <WP_FlexItem isBlock>
                  {/* Slider now defaults to 'px' if value was 'auto', preventing '50auto' */}
                  {RangeControl ? (
                    <RangeControl
                      value={num}
                      onChange={(newNum) => {
                        updateValue(item.key, `${newNum}${unit}`);
                      }}
                      min={item.min ?? 0}
                      max={item.max ?? 100}
                      step={item.step ?? 1}
                      withInputField={false}
                      allowReset={false}
                      aria-label={`${item.label} slider`}
                    />
                  ) : null}
                </WP_FlexItem>

                <WP_FlexItem style={{ maxWidth: "100px" }}>
                  {WP_UnitControl ? (
                    <WP_UnitControl
                      value={fullValue}
                      onChange={(newVal) => updateValue(item.key, newVal)}
                      units={
                        item.units || [
                          { value: "px", label: "px" },
                          { value: "%", label: "%" },
                          { value: "rem", label: "rem" },
                          { value: "em", label: "em" },
                          { value: "vh", label: "vh" },
                          { value: "vw", label: "vw" },
                        ]
                      }
                      size="__unstable-large"
                      disableUnits={item.disableUnits || false}
                    />
                  ) : (
                    <span style={{ fontSize: "10px", color: "red" }}>
                      UnitControl missing
                    </span>
                  )}
                </WP_FlexItem>
              </WP_Flex>
            </div>
          </WP_ToolsPanelItem>
        );
      })}
    </WP_ToolsPanel>
  );
};

export { UnitComponent };
