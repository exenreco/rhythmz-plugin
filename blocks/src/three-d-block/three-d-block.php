<?php
/**
 * Plugin Name: Three D Block
 * Plugin Slug: rhythmz/three-d-block
 * Description: A simple Gutenberg block that displays "Hello, World!".
 * Version:     1.0.0
 * Author:      Exnreco Bell
 * Author URI:  https://exereco.com
 * Text Domain: rhythmz-plugin
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

namespace Rhythmz\Blocks\ThreeDBlock;

\defined( 'ABSPATH' ) || exit;


use Error;

use WP_Error;

use ZipArchive;

use WP_REST_Request;

use WP_REST_Response;

use RecursiveIteratorIterator;

use RecursiveDirectoryIterator;


// When WP add_action function not found
if (! \function_exists('\add_action') ):
  $msg = \esc_html__("@3D Block: no such function 'add_action'.", 'rhythmz-plugin');
  throw new Error("$msg");
  throw new WP_Error("$msg");
endif;

// When WP register_block_type_from_metadata function not found
if (! \function_exists('\register_block_type_from_metadata') ):
  $msg = \esc_html__("@3D Block: no such function 'register_block_type_from_metadata'.", 'rhythmz-plugin');

  \add_action('admin_notices', function() use ($msg) {
    echo '<div class="notice notice-error is-dismissible"><p>' . $msg . '</p></div>';
  });

  throw new Error("$msg");
  throw new WP_Error("$msg");
endif;


if (! \function_exists( __NAMESPACE__ . '\\registerBlock3D' )):
  /**
  * Registers the Rhythmz block.
  */
  function registerBlock3D() {
    $blockDir = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__File__) ) );
    \register_block_type_from_metadata( $blockDir );
  }
endif;

if( ! \function_exists( __NAMESPACE__ . '\\unpack_gltf' ) ):
  function unpack_gltf(\WP_REST_Request $request) {
    try {
        if ( empty( $_FILES['file'] ) ) {
            return new WP_REST_Response( [ 'error' => 'No file uploaded' ], 400 );
        }

        $file = $_FILES['file'];

        // quick sanity checks
        if ( ! class_exists('ZipArchive') ) {
            error_log('[rhythmz] ZipArchive is not available in PHP.'); // server log
            return new WP_REST_Response( [ 'error' => 'Server missing PHP ZipArchive extension' ], 500 );
        }

        $max_size = 50 * 1024 * 1024; // 50MB
        if ( isset( $file['size'] ) && $file['size'] > $max_size ) {
            return new WP_REST_Response( [ 'error' => 'File too large (max 50MB)' ], 400 );
        }

        // Use wp_handle_upload to place the uploaded zip safely into uploads
        require_once ABSPATH . 'wp-admin/includes/file.php';
        $overrides = [ 'test_form' => false ];
        $move = wp_handle_upload( $file, $overrides );

        if ( isset( $move['error'] ) ) {
            error_log('[rhythmz] wp_handle_upload error: ' . $move['error']);
            return new WP_REST_Response( [ 'error' => 'Upload error: ' . $move['error'] ], 500 );
        }

        $zip_path = $move['file'];
        $upload_dir = wp_upload_dir();
        $extract_subdir = '/three-d-block/' . uniqid( 'gltf_', true ) . '/';
        $extract_dir = trailingslashit( $upload_dir['basedir'] ) . ltrim( $extract_subdir, '/' );
        wp_mkdir_p( $extract_dir );

        $zip = new ZipArchive();
        if ( $zip->open( $zip_path ) !== true ) {
            @unlink( $zip_path );
            error_log('[rhythmz] Could not open zip: ' . $zip_path);
            return new WP_REST_Response( [ 'error' => 'Could not open zip archive' ], 500 );
        }

        // scan entries for disallowed files
        for ( $i = 0; $i < $zip->numFiles; $i++ ) {
            $entry = $zip->getNameIndex( $i );
            $lower = strtolower( $entry );
            if ( preg_match( '/\.(php|phtml|exe|sh|bat|pl|py)$/', $lower ) ) {
                $zip->close();
                @unlink( $zip_path );
                error_log('[rhythmz] archive contains disallowed file: ' . $entry);
                return new WP_REST_Response( [ 'error' => 'Archive contains disallowed file types' ], 400 );
            }
        }

        if ( ! $zip->extractTo( $extract_dir ) ) {
            $zip->close();
            @unlink( $zip_path );
            error_log('[rhythmz] extractTo failed for: ' . $zip_path);
            return new WP_REST_Response( [ 'error' => 'Failed to extract archive' ], 500 );
        }

        $zip->close();
        @unlink( $zip_path );

        // find a .gltf/.glb file inside extracted folder
        $found_main = '';
        $it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $extract_dir ) );
        foreach ( $it as $fileinfo ) {
            if ( $fileinfo->isFile() ) {
                $fname = $fileinfo->getFilename();
                if ( preg_match( '/\.(gltf|glb)$/i', $fname ) ) {
                    // relative path inside the extract dir
                    $found_main = ltrim( str_replace( $extract_dir, '', $fileinfo->getPathname() ), '/' );
                    break;
                }
            }
        }

        if ( ! $found_main ) {
            error_log('[rhythmz] no gltf/glb in archive: ' . $extract_dir);
            return new WP_REST_Response( [ 'error' => 'No .gltf/.glb found in archive' ], 400 );
        }

        $base_url = trailingslashit( $upload_dir['baseurl'] ) . ltrim( $extract_subdir, '/' );

        return new WP_REST_Response( [
            'base_url' => $base_url,
            'entry_file' => $found_main,
        ], 200 );

    } catch ( \Throwable $e ) {
        // log full exception to server log for debugging
        error_log('[rhythmz] Exception in unpack: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        return new WP_REST_Response( [ 'error' => 'Server error while processing archive' ], 500 );
    }
  }
endif;


if( ! \function_exists( __NAMESPACE__ . '\\proxy_remote_file' ) ):

  function proxy_remote_file(\WP_REST_Request $request) {
    $remote = $request->get_param('url');
    if (! $remote || ! in_array(parse_url($remote, PHP_URL_SCHEME), array('http','https'), true)) {
      return new WP_REST_Response(array('error' => 'Invalid url'), 400);
    }

    // Optionally restrict allowed hosts to avoid arbitrary SSRF
    // $allowed_hosts = ['example-cdn.com', 'models.example.org'];
    // $host = parse_url($remote, PHP_URL_HOST);
    // if (! in_array($host, $allowed_hosts, true)) { return new WP_REST_Response(['error'=>'host not allowed'], 403); }

    // fetch remote
    $response = wp_remote_get($remote, array(
      'timeout' => 30,
      'stream'  => true,
      'sslverify' => true,
    ));

    if (is_wp_error($response)) {
      return new WP_REST_Response(array('error' => $response->get_error_message()), 500);
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code !== 200) {
      return new WP_REST_Response(array('error' => "Remote responded with {$code}"), 500);
    }

    $content_type = wp_remote_retrieve_header($response, 'content-type') ?: 'application/octet-stream';
    $body_stream = wp_remote_retrieve_body($response); // be careful: streaming vs buffered. Simpler to buffer for now.

    // Determine extension from content-type or URL
    $ext = '';
    if (strpos($content_type, 'gltf') !== false) $ext = 'gltf';
    elseif (strpos($content_type, 'glb') !== false) $ext = 'glb';
    else {
      // fallback to parsing remote path
      $path = parse_url($remote, PHP_URL_PATH);
      $ext = pathinfo($path, PATHINFO_EXTENSION);
      if (! $ext) $ext = 'bin';
    }

    $upload = wp_upload_dir();
    $dest_dir = trailingslashit($upload['basedir']) . 'three-d-block/';
    wp_mkdir_p($dest_dir);
    $hash = substr(md5($remote . time()), 0, 12);
    $filename = "proxy-{$hash}." . $ext;
    $dest_path = $dest_dir . $filename;

    // write file
    $written = file_put_contents($dest_path, $body_stream);
    if ($written === false) {
      return new WP_REST_Response(array('error' => 'Failed to save proxied file'), 500);
    }

    $proxied_url = trailingslashit($upload['baseurl']) . 'three-d-block/' . $filename;

    return new WP_REST_Response(array('proxied_url' => $proxied_url), 200);
  }
endif;


if( ! \function_exists( __NAMESPACE__ . '\\init_3D_Block' ) ):  function init_3D_Block() {

  \add_action('rest_api_init', function () {
    \register_rest_route('rhythmz/v1', '/proxy', array(
      'methods'  => 'GET',
      'callback' => __NAMESPACE__ . "\\proxy_remote_file",
      'permission_callback' => function () {
        return \current_user_can('upload_files');
      },
    ));
  });

  \add_action('rest_api_init', function () {
    \register_rest_route('rhythmz/v1', '/unpack-gltf', array(
        'methods'  => 'POST',
        'callback' => __NAMESPACE__ . "\\unpack_gltf",
        'permission_callback' => function () {
            return \current_user_can('upload_files');
        },
    ));
  });

  \add_action( 'init', __NAMESPACE__ . '\\registerBlock3D' );
} endif;