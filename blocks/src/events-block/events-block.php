<?php
/**
 * Plugin Name: Events Block
 * Plugin Slug: rhythmz/events-block
 * Description: A simple Gutenberg block that displays "Hello, World!".
 * Version:     1.0.0
 * Author:      Exenreco Bell
 * Author URI:  https://exenreco.com
 * Text Domain: rhythmz-plugin
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

namespace Rhythmz\Blocks\EventsBlock;

\defined( 'ABSPATH' ) || exit;

\define( 'TEXT_DOMAIN', 'rhythmz' ) || exit;

\define( 'BLOCK_NAME', 'events-block' ) || exit;

use Error;

use WP_Error;

# Age Gate setup
#################################################################################################
$ageClass = 'class.age-gate.php';

$ageGatePath = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__FILE__)) );

require_once $ageGatePath . $ageClass;

use \Rhythmz\Blocks\EventsBlock\AgeGate as AgeSupport;

if( \class_exists('Rhythmz\\Blocks\\EventsBlock\\AgeGate') ):
  $ageGate = new AgeSupport( ['custom-ages' => null] );
endif;


# Custom Slides
#################################################################################################
$adminClass = 'class.admin.php';

$adminPath = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__FILE__)) );

require_once $adminPath . $adminClass;

use \Rhythmz\Blocks\EventsBlock\Admin as AdminSupport;

if( \class_exists('Rhythmz\\Blocks\\EventsBlock\\Admin') ):
  $admin = new AdminSupport();
endif;


/// FIXIX________________________________________
require_once $adminPath . 'ticket.gen.php';

// When WP add_action function not found
if (! \function_exists('\add_action') ):
  $msg = \esc_html__("@Events Block: no such function 'add_action'.", 'rhythmz-plugin');
  new Error("$msg");
  new WP_Error("$msg");
endif;

// When WP register_block_type_from_metadata function not found
if (! \function_exists('\register_block_type_from_metadata') ):
  $msg = \esc_html__("@Events Block: no such function 'register_block_type_from_metadata'.", 'rhythmz-plugin');

  \add_action('admin_notices', function() use ($msg) {
    echo '<div class="notice notice-error is-dismissible"><p>' . $msg . '</p></div>';
  });

  new Error("$msg");
  new WP_Error("$msg");
endif;

if( ! \function_exists('canLookUpWooTickets') ):
  function canLookUpWooTickets() {
    return \class_exists('\WooCommerce') 
    && \class_exists('\Tribe__Tickets_Plus__Commerce__WooCommerce__Main');
  }
endif;


/*if( ! \function_exists('getVipList') ):
function getVipList() {
  return [
    'Luxury VIP', 'Diamond VIP', 'Platinum VIP', 'Silver VIP',
    'Owners Table VIP', 'Gold VIP',
    'Dancefloor VIP (SM)', 'Dancefloor VIP (LG)',
  ];
}
endif;*/

if( ! \function_exists('sanitizeTickets') ):
/**
	 * SANITIZE TICKETS
	 *
	 * Curate tickets object so they can easily be implemented in to templates.
	 *
	 * @since version 1.6.0
	 */
function sanitizeTickets( $ticketId ) {
  // tickets to exclude from tickets only page
  //$vipList = getVipList();

  // list of all details in ticket
  $ticketsDetails = [];

  // Checks for wooCommerce
  if ( ! canLookUpWooTickets() || ! \function_exists('\wc_get_product') ):
    return $ticketsDetails;
  endif;

  // the selected ticket
  $product = \wc_get_product($ticketId);

  // Checks if tickets can be accessed
  if( ! $product ):
    return $ticketsDetails;
  endif;

  // When WP WC_Product class not found
  if (! $product instanceof \WC_Product) {
    return $ticketsDetails;
  }

  // When WP woocommerce_quantity_input function not found
  if( ! \function_exists('\woocommerce_quantity_input') ){
    return $ticketsDetails;
  }

  //var_dump($product);

  // The name of the targeted ticket
  $name = $product->get_name();

  if ( $name /*&& ! \in_array( $name, $vipList )*/ ):
    // Get price as a float
    $price = (float) $product->get_price();
    $stock = $product->get_stock_quantity();
    $stockStatus = $product->get_stock_status();
    
    // 1. Ticket post content (most common in newer versions)
    $ticket_post = get_post( $ticketId );
    $post_content = $ticket_post ? $ticket_post->post_content : '';

    // 2. Legacy meta fields
    $desc_meta_1 = get_post_meta( $ticketId, '_tribe_tickets_description', true );
    $desc_meta_2 = get_post_meta( $ticketId, '_tribe_ticket_description', true );

    // 3. WooCommerce short description (fallback)
    $short_desc = $product->get_short_description();

    // Pick the first non-empty description
    $description = $post_content ?: $desc_meta_1 ?: $desc_meta_2 ?: $short_desc ?: '';

    $quantityInputDefaults = [
      'id'				=> "ticket_qty_{$ticketId}",
			'step'				=> apply_filters('woocommerce_quantity_input_step', '1', $ticketId),
			'input_class'		=> 'input user-stock',
			'max_value'			=> apply_filters('woocommerce_quantity_input_max', '5', $ticketId),
			'min_value'			=> apply_filters('woocommerce_quantity_input_min', '1', $ticketId),
			'input_name'		=> 'quantity',
			'input_value'		=> '1',
			'placeholder'		=> 'Quantity',
			'data-stock'		=> $stock,
			'data-stock-status'	=> $stockStatus
    ];

    // quantity input element
    $qty = \woocommerce_quantity_input($quantityInputDefaults, $product, false);

    $ticketsDetails = [
      'id'           => $ticketId,
      'name'         => $name,
      'description'  => $description,
      'stocks'       => [
        'status'	=> $stockStatus, // the status of the stock
        'quantity'	=> $stock, // the number of stocks remaining
      ],
      'price'        => [
        'dollars' 		=> floor( $price ), // Whole dollar amount
        'cents'   		=> round( ( $price - floor( $price ) ) * 100 ), // Cents part
        'totalPrice'	=> $product->get_price()
      ],
      'markup' => "{$qty}"
    ];
  endif;
  return $ticketsDetails;
}
endif;

function getEventsCalendarEvents() {
  // tribe get events function must exists
  if ( ! \function_exists('tribe_get_events') ):
    return (object) [ 'ids' => (object) [], 'events' => (object) [] ];
  endif;

  $woo = canLookUpWooTickets()
  ? \Tribe__Tickets_Plus__Commerce__WooCommerce__Main::get_instance()
  : null;

  // Tribe Events
  $events = \tribe_get_events([ // Query event ID's starting from "now".
    'eventDisplay'   => 'custom',
    'posts_per_page' => -1,       # currently gets all events: use limmiter if needed eg. 10
    'fields'         => 'ids',    # new to this plugin, only getting the field id
    'start_date'     => 'now'
  ]);

  // Collected events
  $eventsList = [];

  
  foreach ( $events as $event ):
    if( isset($event) ):

      $age = ( \function_exists('\get_post_meta') ) 
      ? \get_post_meta($event, '_event_age_range', true)
      : null;

      $title = ( \function_exists('\get_the_title') ) 
      ? \get_the_title( $event )
      : null;

      $endDate = ( \function_exists('\tribe_get_end_date') )
      ? \tribe_get_end_date( $event, false, 'c' ) // ISO date
      : null;

      $startDate = ( \function_exists('\tribe_get_start_date') )
      ? \tribe_get_start_date( $event, false, 'c' ) // ISO date
      : null;

      ## Retrieve the featured image ID
      $mediaId = null;
      if( \function_exists('\get_post_thumbnail_id') ):
        $thumbnailId = \get_post_thumbnail_id($event);
        if( $thumbnailId && $thumbnailId > 0 ):
          $mediaId = $thumbnailId;
        endif;
      endif;

      ## Retrieve featured image type
      $mediaType = null;
      if( (int)$mediaId > 0 && \function_exists('\get_post_mime_type') ):
        $mime = \get_post_mime_type( $mediaId );
        if ($mime && strpos($mime, 'video/') === 0):
          $mediaType = "video";
        elseif ($mime && strpos($mime, 'image/') === 0):
          $mediaType = "image";
        endif;
      endif;

      ## Retrieve featured image URL
      $mediaUrl = null;
      if( $mediaId && $mediaType && \function_exists('\wp_get_attachment_image_url' ) ):
        if( $mediaType === 'image' ):
          $mediaUrl = \wp_get_attachment_image_url( $mediaId, 'large' );
        elseif( $mediaType === 'video' ):
          $mediaUrl = \wp_get_attachment_url( $mediaId );
        endif;
      endif;


      ## Retrieve event wooCommerce tickets
      $wooTickets = ( $woo && isset($woo) )
      ? $woo->get_tickets_ids( $event )
      : [];

      ## sanitize tickets
      $sanitizedTickets = [];
      foreach ( $wooTickets as $ticket ) {
        $sanitizedTickets[] = sanitizeTickets( $ticket );
      }


      $permalink = ( \function_exists('\get_permalink') )
      ? \get_permalink( $event )
      : null;

      $post = (\function_exists('\get_post')) ? \get_post($event) : null;

      $excerpt = ( \function_exists('wp_trim_words') && $post)
      ? \wp_trim_words( $post->post_content, 30 ) 
      : null;

      ## Create a new custom event object
      $eventsList[ $event ] = [
        'age'         =>  ( $age && ! empty( $age) ) ? $age : null,
        'title'       => ( $title && ! empty( $title) ) 
          ? \html_entity_decode($title, ENT_QUOTES, 'UTF-8') 
          : null,
        'excerpt'     => ( $excerpt && !empty($excerpt) ) 
          ? \html_entity_decode($excerpt, ENT_QUOTES, 'UTF-8') 
          : null,
        'endDate'     => ( $endDate && ! empty($endDate) ) ? $endDate : null,
        'mediaId'     => ( $mediaId && !empty($mediaId) ) ? $mediaId : null,
        'mediaUrl'    => ( $mediaUrl && !empty($mediaUrl) ) ? \esc_url_raw($mediaUrl) : null,
        'mediaType'   => ( $mediaType && !empty($mediaType) ) ? $mediaType : null,
        'tickets'     => ( $sanitizedTickets && !empty($sanitizedTickets) ) ? (array) $sanitizedTickets : [],
        'startDate'   => ( $startDate && ! empty($startDate) ) ? $startDate : null,
        'permalink'   => ( $permalink && ! empty($permalink) ) ? \esc_url_raw($permalink) : null,
        'slideType'   => 'event',
        'cartUrl'     => ( \function_exists('\site_url') ) ? \esc_url_raw(\site_url('/cart/')): null,
      ];
    endif;
  endforeach;

  ## unset variables that are no longer needed
  unset( 
    $woo, $event, $title, $endDate, $posterId, 
    $posterUrl, $wooTickets, $startDate, $permalink, $description
  );

  ## return null when no events found
  if ( ! $eventsList || empty($eventsList) ):
    return (object) [ 'ids' => (object) [], 'events' => (object) [] ];
  endif;

	## otherwise return events
	return (object) [ 'ids' => (object) $events, 'events' => (object) $eventsList ];
}

/**
 * getOtherSlides
 * @return void
 */
function getOtherSlides() {
  return [];
}

function getOrganizer() {
  return [
    'id' => 1,
    'name'      => 'Rhythmz Lounge - Night Club',
    'logo'      => 'https://rhythmz.com/wp-content/uploads/2026/04/rhythmz.png',
    'shortName' => 'Rhythmz',
    'address'   => [
      'street'  => '10841 Q Street',
      'city'    => 'Omaha',
      'state'   => 'NE',
      'zip'     => '68137',
      'country' => 'USA'
    ],
    'socialLinks' => [
      'twitter' => ['icon' => 'twitter', 'url' => 'https://twitter.com/rhythmz'],
      'facebook' => ['icon' => 'facebook', 'url' => 'https://facebook.com/rhythmz'],
      'instagram' => ['icon' => 'instagram', 'url' => 'https://instagram.com/rhythmz'],
    ],
  ];
}

/**
 * registerEventsBlockEvents
 * @return void
 */
function registerEventsBlockEvents() {
  $blockDir = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__FILE__) ) );
  \register_block_type_from_metadata($blockDir);
}

/**
 * localizedEditorAssets
 * @return void
 */
function localizedEditorAssets() {
  $organizer = getOrganizer();
  $otherSlides = getOtherSlides();
  $eventsData = getEventsCalendarEvents();

  $data = [
    'events'      => $eventsData->events,
    'restRoot'    => \esc_url_raw( rest_url( 'tribe/events/v1/' ) ),
    'organizer'   => $organizer,
    'otherSlides' => $otherSlides,
  ];
  
  $editor_handle = \generate_block_asset_handle(TEXT_DOMAIN . '/'. BLOCK_NAME,'editorScript', 0);
  \wp_localize_script( $editor_handle, 'RhythmzEventsBlockData', $data );
}


function localizedViewAssets() {
  $organizer = getOrganizer();
  $otherSlides = getOtherSlides();
  $eventsData = getEventsCalendarEvents();

  $data = [
    'events'      => $eventsData->events,
    'restRoot'    => \esc_url_raw( rest_url( 'tribe/events/v1/' ) ),
    'organizer'   => $organizer,
    'otherSlides' => $otherSlides,
  ];
  
  $script_handle = \generate_block_asset_handle( TEXT_DOMAIN . '/'. BLOCK_NAME, 'viewScript', 0);

  wp_localize_script( $script_handle, 'RhythmzEventsBlockData', $data );

  ## Start WC Session
  if (function_exists('WC') && !WC()->session->has_session()) {
    WC()->session->set_customer_session_cookie(true);
  }

  ## This makes a variable called 'my_cart_data' available in JS
  wp_localize_script($script_handle, 'cart_data', [
    'root'  => esc_url_raw(rest_url()),
    'nonce' => wp_create_nonce('wc_store_api')
  ]);
}

/**
 * Initialize the Events Block
 * @return void
 */
function init_Events_Block() {
  \add_action( 'init', __NAMESPACE__ . '\\registerEventsBlockEvents' );
  \add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\localizedViewAssets');
  \add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\localizedEditorAssets');
}
