"use strict";

import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { MediaUpload } from "@wordpress/block-editor";
import { fontAwesomeIcons } from "./icon.picker.config.js";
import { Button, TextControl, Modal, BaseControl } from "@wordpress/components";

const IconPicker = ({ onSelect, render }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Filter icons based on search
  const filteredIcons = Object.keys(fontAwesomeIcons).filter((key) =>
    fontAwesomeIcons[key].label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* 
               We execute the 'render' function passed from the parent. 
               We pass the 'openModal' function to it so the button can trigger this component.
            */}
      {render({ open: openModal })}

      {isOpen && (
        <Modal
          title={__("Select an Icon", "ultimate-icons")}
          onRequestClose={closeModal}
        >
          <div className="icon-picker-modal-content">
            <TextControl
              label={__("Search", "ultimate-icons")}
              value={search}
              onChange={(val) => setSearch(val)}
              autoFocus
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />

            <div
              className="icon-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                gap: "10px",
                maxHeight: "300px",
                overflowY: "auto",
                margin: "20px 0",
              }}
            >
              {filteredIcons.map((key) => (
                <Button
                  key={key}
                  variant="tertiary"
                  onClick={() => {
                    onSelect({
                      type: "fa",
                      path: fontAwesomeIcons[key].path,
                      value: key,
                      label: fontAwesomeIcons[key].label,
                    });
                    closeModal();
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                    padding: "10px",
                  }}
                >
                  <svg viewBox="0 0 512 512" width="24" height="24">
                    <path d={fontAwesomeIcons[key].path} fill="currentColor" />
                  </svg>
                  <span style={{ fontSize: "10px", marginTop: "5px" }}>
                    {fontAwesomeIcons[key].label}
                  </span>
                </Button>
              ))}
            </div>

            <hr />

            <BaseControl
              label={__("Or upload a custom SVG", "ultimate-icons")}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            >
              <MediaUpload
                onSelect={(media) => {
                  onSelect({
                    id: media.id,
                    type: "custom",
                    value: media.url,
                    label: media.title || media.alt,
                  });
                  closeModal();
                }}
                allowedTypes={["image/svg+xml"]}
                render={({ open }) => (
                  <Button variant="secondary" onClick={open}>
                    {__("Upload SVG", "ultimate-icons")}
                  </Button>
                )}
              />
            </BaseControl>
          </div>
        </Modal>
      )}
    </>
  );
};

export { IconPicker };
