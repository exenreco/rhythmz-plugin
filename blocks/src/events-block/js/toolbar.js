import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { justifyLeft, justifyCenter, justifyRight } from '@wordpress/icons';

export const ToolBar = ( {attributes, setAttributes} ) => {
    return (
        <BlockControls>
            <AlignmentToolbar
                value={attributes.align}
                onChange={(newAlign) => setAttributes({ align: newAlign })}
            />
            <ToolbarGroup>
                <ToolbarButton
                    icon={justifyLeft}
                    label="Justify Left"
                    isPressed={attributes.justify === 'left'}
                    onClick={() => setAttributes({ justify: 'left' })}
                />
                <ToolbarButton
                    icon={justifyCenter}
                    label="Justify Center"
                    isPressed={attributes.justify === 'center'}
                    onClick={() => setAttributes({ justify: 'center' })}
                />
                <ToolbarButton
                    icon={justifyRight}
                    label="Justify Right"
                    isPressed={attributes.justify === 'right'}
                    onClick={() => setAttributes({ justify: 'right' })}
                />
            </ToolbarGroup>
        </BlockControls>
    );
}
