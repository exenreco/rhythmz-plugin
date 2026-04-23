"use strict";

import { useBlockProps } from "@wordpress/block-editor";

export const Save = ({ attributes }) => {
  const // Extract block class name and icon from attributes
    { blockClassName, icon } = attributes || {},
    // Use the saved blockClassName to manage css styles
    uniqueClassName = blockClassName,
    // Current block props
    blockProps = useBlockProps.save({ className: uniqueClassName }),
    // Template: current block render
    template = () => (
      <>
        {/* Selected State: Just show the icon, no buttons blocking view */}
        {icon?.type === "fa" &&
          typeof icon?.path === "string" &&
          icon?.path.length > 0 && (
            <svg
              viewBox="0 0 512 512"
              aria-hidden="true"
              className="icon svg"
              width={icon?.size || 18}
              height={icon?.size || 18}
            >
              <path d={icon?.path} />
            </svg>
          )}
        {icon?.type === "custom" && (
          <img
            src={icon?.value}
            alt="icon"
            className="icon img"
            width={icon?.size || 18}
            height={icon?.size || 18}
          />
        )}
        {icon?.showLabel && icon?.label && (
          <span className="label">{icon?.label}</span>
        )}
      </>
    );

  return (
    <>
      <style type="text/css">
        {(() => `
        .${uniqueClassName} {
          width: auto;
          max-width: 100%;
          min-width: 20px;
          line-height: 0;
          position: relative;
          display: block;
          cursor: default;
          opacity: ${icon?.opacity || 1};
          min-height: ${icon?.minHeight || "auto"};
          padding-top: ${icon?.padding?.top || 0};
          padding-left: ${icon?.padding?.left || 0};
          padding-right: ${icon?.padding?.right || 0};
          padding-bottom: ${icon?.padding?.bottom || 0};
          border-top: 
            ${icon?.borders?.top?.width || "none"}
            ${icon?.borders?.top?.style || "none"}
            ${icon?.borders?.top?.color || "#000"};
          border-left: 
            ${icon?.borders?.left?.width || "none"}
            ${icon?.borders?.left?.style || "none"}
            ${icon?.borders?.left?.color || "#000"};
          border-right: 
            ${icon?.borders?.right?.width || "none"}
            ${icon?.borders?.right?.style || "none"}
            ${icon?.borders?.right?.color || "#000"};
          border-bottom: 
            ${icon?.borders?.bottom?.width || "none"}
            ${icon?.borders?.bottom?.style || "none"}
            ${icon?.borders?.bottom?.color || "#000"};
          border-top-left-radius: ${icon?.radius?.topLeft || 0};
          border-top-right-radius: ${icon?.radius?.topRight || 0};
          border-bottom-left-radius: ${icon?.radius?.bottomLeft || 0};
          border-bottom-right-radius: ${icon?.radius?.bottomRight || 0};
          background: ${
            icon?.colors?.iconBgColorGradient
              ? icon?.colors?.iconBgColorGradient
              : icon?.colors?.iconBgColor || "none"
          };
          text-align: ${icon?.textAlignment || "center"};
        }
        .${uniqueClassName} .icons-block-render {
          gap: ${icon?.gap || `0`}px;
          flex: 0 0 auto;
          color: ${icon?.colors?.iconColor || "#333333"};
          width: 100%;
          height: 100%;
          display: flex;
          position: relative;
          line-height: 0;
          align-items: ${icon?.alignment || "center"};
          justify-content: ${icon?.textAlignment || "center"};
          flex-direction: row;
        }
        .${uniqueClassName} .icons-block-render .img,
        .${uniqueClassName} .icons-block-render .svg,
        .${uniqueClassName} .icons-block-render .icon {
          fill: ${icon?.colors?.iconColor || "#333333"};
        }
        .${uniqueClassName} .icons-block-render .label {
          font-size: ${icon?.fontSize || "18px"};
          color: ${icon?.colors?.iconColor || "#333333"};
        }
      `)()}
        {/* Link CSS */}
        {icon?.link?.hasLink
          ? `
          .${uniqueClassName}.__has_link {
            cursor: pointer;
          }
          .${uniqueClassName}.__has_link a {
            text-decoration: none;
          }
          .${uniqueClassName}.__has_link:hover {
            opacity: 1;
            background: ${
              icon?.colors?.iconBgColorGradientHover
                ? icon?.colors?.iconBgColorGradientHover
                : icon?.colors?.iconBgColorHover || "none"
            };
          }
          .${uniqueClassName}.__has_link:hover .svg,
          .${uniqueClassName}.__has_link:hover .img,
          .${uniqueClassName}.__has_link:hover .icon {
            fill: ${icon?.colors?.iconColorHover || "#333333"};
          }
          .${uniqueClassName}.__has_link:hover .label {
            color: ${icon?.colors?.iconColorHover || "#333333"};
          }
        `
          : ""}
      </style>
      <div {...blockProps}>
        {icon?.link.hasLink ? (
          <a
            className="icons-block-render"
            href={icon?.link?.url || "#"}
            target={icon?.link?.newTab ? "_blank" : "_self"}
            rel={icon?.link?.newTab ? "noopener noreferrer" : ""}
          >
            {template()}
          </a>
        ) : (
          <div className="icons-block-render">{template()}</div>
        )}
      </div>
    </>
  );
};
