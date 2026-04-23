<?php

namespace Rhythmz\Blocks\EventsBlock\TicketGen;

use Error;
use Throwable;
use Exception;
use WP_REST_Response;
use Tribe__Tickets_Plus__Commerce__WooCommerce__Main;

add_action('rest_api_init', fn () => register_rest_route('ticketgen/v1', '/generate', [
    'methods'             => 'POST',
    'permission_callback' => fn () => current_user_can('edit_products'),
    'callback' => function ($request) {
        ob_start(); // catch any stray output
        try {
            $params = $request->get_json_params();
            $event_id = \intval($params['event_id'] ?? 0);
            $templates = $params['templates'] ?? [];

            if (!$event_id) {
                return new WP_REST_Response(['message' => 'No Event ID'], 400);
            }

            // MODERN TEC WAY: Check if the WooCommerce Ticket provider exists
            if ( ! function_exists('tribe') ) {
                return new WP_REST_Response(['message' => 'The Events Calendar is not active.'], 400);
            }

            if ( ! \class_exists('Tribe__Tickets_Plus__Commerce__WooCommerce__Main') ) {
                return new WP_REST_Response(['message' => 'Event Tickets Plus WooCommerce provider not found. Is it active?'], 400); // Abort if provider not loaded
            }

            // This is the safest way to get the WooCommerce provider in TEC 5.x and 6.x
            try {
                
                $provider = Tribe__Tickets_Plus__Commerce__WooCommerce__Main::get_instance();
            } catch ( \Exception $e ) {
                return new WP_REST_Response(['message' => 'Event Tickets Plus WooCommerce provider not found. Is it active?'], 400);
            }

            $tickets_payload = [];

            foreach ($templates as $tpl) {
                if (empty($tpl['name'])) continue;

                // Create the ticket
                $ticket_id = $provider->ticket_add($event_id, [
                    'ticket_name'        => sanitize_text_field($tpl['name']),
                    'ticket_description' => '',
                    'ticket_price'       => sanitize_text_field($tpl['price']),
                    'ticket_stock'       => \intval($tpl['stock']),
                    'ticket_status'      => 'publish',
                ]);

                if ($ticket_id && !is_wp_error($ticket_id)) {
                    do_action('tribe_tickets_ticket_created', $ticket_id, $event_id);
                    $tickets_payload[] = ['id' => $ticket_id, 'name' => $tpl['name']];
                }
            }

            return new WP_REST_Response(['tickets' => $tickets_payload], 200);

        } catch (\Throwable $e) {
            // This ensures that even if it crashes, we get JSON back, not HTML
            return new WP_REST_Response([
                'error' => $e->getMessage(),
                'line'  => $e->getLine()
            ], 500);
        } finally {
            ob_end_clean();
        }
    }
]));

// 2. Enqueue Script - Improved for stability
add_action('current_screen', function($screen) {
    if (!$screen || $screen->post_type !== 'tribe_events') return;

    $js_path = plugin_dir_path(__FILE__) . 'libs/ticket.gen.ui.js';
    $js_url  = plugin_dir_url(__FILE__) . 'libs/ticket.gen.ui.js';
    $version = file_exists($js_path) ? filemtime($js_path) : '1.0.0';

    wp_enqueue_script('ticket-gen-ui', $js_url, [
        'wp-api','wp-plugins','wp-edit-post','wp-blocks','wp-element','wp-components','wp-data','wp-i18n'
    ], $version, true);

    wp_localize_script('ticket-gen-ui', 'wpApiSettings', [
        'root'  => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ]);
}, 20); // Priority 20 ensures we run after TEC registers its scripts
