import apiFetch from '@wordpress/api-fetch';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect, useRef } from '@wordpress/element';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';

export default function Sidebar( props ) {
    const { attributes, setAttributes, clientId } = props;
    const { gltfPath } = attributes;
    const containerRef = useRef(null);
    const [ uploading, setUploading ] = useState(false);

    function isProbablyZip(file) {
        const name = file.name || '';
        const ext = (name.split('.').pop() || '').toLowerCase();
        if (ext === 'zip') return true;
        const t = (file.type || '').toLowerCase();
        if (t.includes('zip') || t === 'application/octet-stream') return true;
        return false;
    }

    async function handleZipUpload(file) {
        if (! file) return;
        console.log('Uploading file:', file.name, file.type, file.size);

        if (! isProbablyZip(file)) {
            // show friendly UI
            alert('Please upload a .zip file.');
            return;
        }

        const fd = new FormData();
        fd.append('file', file);
        // optionally include nonce if your REST endpoint expects it
        // fd.append('_wpnonce', window.wpApiSettings.nonce);

        try {
            const res = await apiFetch({
            path: '/rhythmz/v1/unpack-gltf',
            method: 'POST',
            body: fd,
            });
            console.log('unpack response', res);
            if (res && res.base_url) {
            setAttributes({ gltfPath: res.base_url, entryFile: res.entry_file || 'scene.gltf' });
            } else {
            console.warn('Unexpected response', res);
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed: ' + (err.message || err));
        }
    }

    const Controls = (
    <InspectorControls>
        <PanelBody title="3D Model">
          <TextControl
            label="Model base URL"
            value={gltfPath || ''}
            onChange={(val) => setAttributes({ gltfPath: val })}
            help="Paste a folder URL or use Upload to upload a .zip with the exported glTF and all assets"
          />
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) handleZipUpload(f);
            }}
          />
        </PanelBody>
      </InspectorControls>
    );

    return Controls;
}