"use strict";

import { InspectorControls } from "@wordpress/block-editor";
import { UnitComponent } from "../../../assets/components/unit.component.js";
import { BorderComponent } from "../../../assets/components/border.component.js";
import { IconPicker } from "../../../assets/components/icon.picker.component.js";
import { NumericComponent } from "../../../assets/components/numeric.component.js";
import { PaddingComponent } from "../../../assets/components/padding.component.js";
import { FontSizeComponent } from "../../../assets/components/fontsize.component.js";
import { DualTabPanel } from "../../../assets/components/dual.tabpanel.component.js";
import { AppearanceComponent } from "../../../assets/components/appearance.component.js";
import { BorderRadiusComponent } from "../../../assets/components/border.radius.component.js";
import {
  Flex,
  Button,
  FlexItem,
  PanelRow,
  PanelBody,
  BaseControl,
  TextControl,
  ToggleControl,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem,
} from "@wordpress/components";

export const Sidebar = ({ attributes, setAttributes, handleSelect }) => {
  const 
  ToolsPanel = __experimentalToolsPanel,
  ToolsPanelItem = __experimentalToolsPanelItem;

  const
  { icon } = attributes,
  { size, type, path, value, colors, borders, showLabel, link, label} = icon || {},
  iconSize = typeof size === "number" ? size : 18,
  iconType = typeof type === "string" ? type : "",
  iconPath = typeof path === "string" ? path : "",
  iconValue = typeof value === "string" ? value : "",
  iconColor = typeof colors?.iconColor === "string" ? colors.iconColor : "#444444";

  return (
    <InspectorControls>
      {/* ICON SELECTION ROW */}
      <BaseControl
        label={<span style={{ padding: "16px" }}>Icon Selection</span>}
        __next40pxDefaultSize={true}
        __nextHasNoMarginBottom={false}
      >
        <Flex
          gap={1}
          align="center"
          style={{ justifyContent: "center", padding: "16px" }}
        >
          {/* Preview box */}
          <FlexItem>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0, // prevent shrinking
                color: iconColor || "#000",
              }}
            >
              {iconType === "fa" && (
                <svg
                  viewBox="0 0 512 512"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d={iconPath} />
                </svg>
              )}
              {iconType === "custom" && (
                <img
                  src={iconValue}
                  alt=""
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
              )}
              {!iconType && (
                <span style={{ fontSize: "20px", color: "#ccc" }}>?</span>
              )}
            </div>
          </FlexItem>

          {/* Button */}
          <FlexItem style={{ flexGrow: 1 }}>
            <IconPicker
              onSelect={handleSelect}
              render={({ open }) => (
                <Button
                  variant="secondary"
                  onClick={open}
                  style={{ display: "block", width: "100%" }}
                >
                  {iconType ? "Replace Icon" : "Select Icon"}
                </Button>
              )}
            />
          </FlexItem>
        </Flex>
      </BaseControl>

      <DualTabPanel
        styleControls={
          <>
            <AppearanceComponent
              title="Color Options"
              options={[
                {
                  key: "iconColor",
                  label: "Color",
                  hasHover: attributes?.icon?.link?.hasLink ? true : false,
                  hasColor: true,
                  hasGradient: false,
                },
                {
                  key: "iconBgColor",
                  label: "Background",
                  hasHover: attributes?.icon?.link?.hasLink ? true : false,
                  hasColor: true,
                  hasGradient: true,
                }
              ]}
              attributeName="icon"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <FontSizeComponent
              title="Font Size"
              attributeName="icon"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[{ key: "fontSize", label: "Font Size" }]}
            />
            <NumericComponent
              title="Sizing"
              attributeName="icon"
              //subAttributeName="size" not needed here
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "size",
                  min: 1,
                  max: 100,
                  step: 1,
                  label: "Icon Size",
                  isShownByDefault: true,
                },
              ]}
            />
            <NumericComponent
              title="Opacity"
              attributeName="icon"
              //subAttributeName="opacity" not needed here
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "opacity",
                  min: 0.1,
                  max: 1,
                  step: 0.1,
                  label: "Icon Opacity",
                  isShownByDefault: true,
                },
              ]}
            />
            <NumericComponent
              title="Spacing"
              attributeName="icon"
              //subAttributeName="gap" not needed here
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "gap",
                  min: 0,
                  max: 100,
                  step: 1,
                  label: "Block Spacing",
                  isShownByDefault: true,
                },
              ]}
            />
            <UnitComponent
              title="Dimensions"
              attributeName="icon"
              //subAttributeName="minHeight" not needed here
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "minHeight",
                  min: 0,
                  max: 1000,
                  step: 1,
                  label: "Minimum Height",
                  isShownByDefault: true,
                  units: [
                    { value: "px", label: "px" },
                    { value: "%", label: "%" },
                    { value: "vh", label: "vh" },
                    { value: "vw", label: "vw" },
                    { value: "em", label: "em" },
                    { value: "rem", label: "rem" },
                    { value: "pt", label: "pt" },
                  ],
                },
              ]}
            />
            <PaddingComponent
              attributeName="icon"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderComponent
              attributeName="icon"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              attributeName="icon"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        }
        settingsControls={
          <>
            <PanelBody title="Icon Settings" initialOpen={true}>
              <ToolsPanel
                label="Icon Settings"
                className="icons-block-tools-panel"
                resetAll={() => {
                  const parentObj = attributes.icon || {};
                  setAttributes({
                    icon: {
                      ...parentObj,
                      label: "",
                      link: { hasLink: false, url: "" },
                      showLabel: false,
                    },
                  });
                }}
              >
                <ToolsPanelItem
                  label="Show icon label"
                  hasValue={() => attributes?.icon?.showLabel}
                  onToggle={(val) =>
                    setAttributes({ icon: { ...icon, showLabel: val } })
                  }
                  isShownByDefault
                >
                  <ToggleControl
                    label="Show icon label"
                    checked={showLabel}
                    onChange={(val) =>
                      setAttributes({ icon: { ...icon, showLabel: val } })
                    }
                  />
                </ToolsPanelItem>

                <ToolsPanelItem
                  label="Show icon label"
                  hasValue={() => attributes?.icon?.showLabel}
                  onToggle={(val) =>
                    setAttributes({ icon: { ...icon, showLabel: val } })
                  }
                  isShownByDefault
                >
                  <ToggleControl
                    label="Enable icon link"
                    checked={link.hasLink}
                    onChange={(val) =>
                      setAttributes({
                        icon: { ...icon, link: { ...link, hasLink: val } },
                      })
                    }
                  />
                </ToolsPanelItem>
                {attributes?.icon?.link?.hasLink && (
                  <ToolsPanelItem
                    label="Open in new tab"
                    hasValue={() => attributes?.icon?.link?.newTab}
                    onToggle={(val) =>
                      setAttributes({
                        icon: { ...icon, link: { ...link, newTab: val } },
                      })
                    }
                    isShownByDefault
                  >
                    <ToggleControl
                      label="Open in new tab"
                      checked={link.newTab}
                      onChange={(val) =>
                        setAttributes({
                          icon: { ...icon, link: { ...link, newTab: val } },
                        })
                      }
                    />
                  </ToolsPanelItem>
                )}
              </ToolsPanel>

              {attributes?.icon?.showLabel && (
                <PanelRow>
                  <TextControl
                    label="Icon Label"
                    value={attributes?.icon?.label}
                    onChange={(label) =>
                      setAttributes({
                        icon: { ...icon, label: label },
                      })
                    }
                    __next40pxDefaultSize
                  />
                </PanelRow>
              )}

              {attributes?.icon?.link?.hasLink && (
                <PanelRow>
                  <TextControl
                    label="Link URL"
                    value={attributes?.icon?.link?.url}
                    onChange={(url) =>
                      setAttributes({
                        icon: { ...icon, link: { ...link, url: url } },
                      })
                    }
                    __next40pxDefaultSize
                  />
                </PanelRow>
              )}
            </PanelBody>
          </>
        }
      />
    </InspectorControls>
  );
};
