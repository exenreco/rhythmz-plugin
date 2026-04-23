"use strict";

import { replace } from "@wordpress/icons"; // Standard WP "Replace/Swap" icon
import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import { BlockControls, AlignmentToolbar } from "@wordpress/block-editor";
import { justifyLeft, justifyCenter, justifyRight } from "@wordpress/icons";
import { IconPicker } from "../../../assets/components/icon.picker.component.js";

export const Toolbar = ({ attributes, setAttributes, handleSelect }) => {
  const 
  { icon } = attributes,
  { alignment, textAlignment } = icon || {};
  return (
    <BlockControls>
      <AlignmentToolbar
        value={textAlignment}
        onChange={(newAlign) =>
          setAttributes({ icon: { ...icon, textAlignment: newAlign } })
        }
      />
      <ToolbarGroup>
        <ToolbarButton
          icon={justifyLeft}
          label="Justify Left"
          isPressed={attributes.icon.alignment === "left"}
          onClick={() =>
            setAttributes({ icon: { ...icon, alignment: "left" } })
          }
        />
        <ToolbarButton
          icon={justifyCenter}
          label="Justify Center"
          isPressed={attributes.icon.alignment === "center"}
          onClick={() =>
            setAttributes({ icon: { ...icon, alignment: "center" } })
          }
        />
        <ToolbarButton
          icon={justifyRight}
          label="Justify Right"
          isPressed={attributes.icon.alignment === "right"}
          onClick={() =>
            setAttributes({ icon: { ...icon, alignment: "right" } })
          }
        />
      </ToolbarGroup>
      <ToolbarGroup>
        <IconPicker
          onSelect={handleSelect}
          render={({ open }) => (
            <ToolbarButton onClick={open} label="Change Icon" icon={replace} />
          )}
        />
      </ToolbarGroup>
    </BlockControls>
  );
};
