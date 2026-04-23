import { useBlockProps } from "@wordpress/block-editor";

const Deprecated = [
  {
    // The save function exactly as it was BEFORE the change
    save({ attributes }) {
      const classes = [
          "events-block",
          attributes.align ? `align-${attributes.align}` : null,
          attributes.justify ? `justify-${attributes.justify}` : null,
        ]
          .filter(Boolean)
          .join(" "),
        eventsJson = JSON.stringify(attributes.events || {}),
        sliderJson = JSON.stringify(attributes.slider || {}),
        slidesJson = JSON.stringify(attributes.slides || {}),
        blockProps = useBlockProps.save({
          className: classes,
          "data-events": eventsJson,
          "data-slider": sliderJson,
          "data-slides": slidesJson,
        });

      return (
        <div {...blockProps}>
          <div className="__eb_inst_tar" />
        </div>
      );
    },

    migrate: (attributes, savedAttributes) => {
      return { ...attributes };
    },

    // The attributes schema from the previous version
    attributes: {
      align: { type: "string", default: "" },
      justify: { type: "string", default: "" },
      events: { type: "object", default: {} },
      slides: { type: "object", default: {} },
      slider: { type: "object", default: {} },
    },
  },
];

export { Deprecated };
