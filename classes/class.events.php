<?php

namespace Rhythmz\Plugin\Events;


if ( class_exists( __NAMESPACE__ . '\\Events') ):
    return;
endif;

/**
 * Events
 *
 * @link https://rhythmz-lounge.com
 *
 * @package WordPress
 * @subpackage rhythmz-plugin
 * @since Rhthmz Plugin 1.0.6
 */
class Events {

	/**
	 * REGISTER RHYTHMZ TICKETS
	 *
	 * Register events that hooks into the the sites ticket page, using template_redirect (runs later).
	 *
	 * @since version 1.6.0
	 */
	function register_rhythmz_tickets() {
		// Initialize the tickets page
		add_action("template_redirect", array($this, "init_tickets_page"));

		// Enqueue site frontend scripts
		add_action( 'wp_enqueue_scripts', array($this, 'ticket_manager_scripts'), 10, 3);
	}

	/**
	 * INIT TICKETS PAGE
	 *
	 * Filters the content of the sites ticket page and list events and tickets.
	 *
	 * @since version 1.6.0
	 */
	function init_tickets_page() {
		if ( function_exists('is_page') && is_page(26) ) {
			add_filter('the_content', array($this, 'generate_tickets_page'));
		}
	}

	function ticket_manager_scripts() {
		// tickets css
		wp_enqueue_style(
			'splicer-ticket-manager-css',
			get_template_directory_uri() . '/plugins/Splicer/tickets-manager/assets/tickets.css',
			array(),
			'4.0.0',
			'all'
		);
		// Tickets Javascript
		wp_enqueue_script(
			'splicer-ticket-manager-js',
			get_template_directory_uri() . '/plugins/Splicer/tickets-manager/assets/tickets.js',
			array('jquery'),
			'6.2.0',
			true
		);
	}

	/**
	 * GENERATE TICKETS PAGE
	 *
	 * Append ticket markup to the tickets page content.
	 *
	 * @since version 1.6.0
	 */
	function generate_tickets_page($content) {
		// the generated tickets view
		$ticketsView = $this->generateEventTemplates();

		// If ticket_data is an array, use the first element.
		if ( is_array($ticketsView) ) {
			$content .= "<main class='splicer ticket-manager'>" . $ticketsView[0] . "</main>";
		} else {
			$content .= "<main class='splicer ticket-manager'>$ticketsView</main>";
		}
		return $content;
	}

	/**
	 * CAN ADJUST DATE
	 *
	 * Checks if php can manipulate date.
	 *
	 * @since version 1.6.0
	 */
	function can_adjust_date() {
		return function_exists('date_format') && function_exists('date_create') && function_exists('get_post_meta');
	}

	/**
	 * GET EVENTS
	 *
	 * Fetches all tribe events defined starting from now, the current date
	 *
	 * @since version 1.6.0
	 */
	function get_events() {

		// tribe get events function must exists
		if ( ! function_exists('tribe_get_events') ):
			return null;
		endif;

		// Query events starting from "now".
		$events = tribe_get_events([
			'eventDisplay'   => 'custom',
			'posts_per_page' => 10,
			'start_date'     => 'now'
		]);

		// return null when no events found
		if ( empty($events) ):
			return null;
		endif;

		// otherwise return events
		return $events;
	}

	/**
	 *
	 */
	function get_vip_list() {
		return [
			'Luxury VIP', 'Diamond VIP', 'Platinum VIP', 'Silver VIP',
			'Owners Table VIP', 'Gold VIP',
			'Dancefloor VIP (SM)', 'Dancefloor VIP (LG)',
		];
	}

  /**
	 * CAN LOOKUP WOO TICKETS
	 *
	 * Checks if WooCommerce is available for events tickets.
	 *
	 * @since version 1.6.0
	 */
	function can_lookup_woo_tickets(){
		return class_exists('WooCommerce') && class_exists('Tribe__Tickets_Plus__Commerce__WooCommerce__Main');
	}

	/**
	 * SANITIZE EVENTS
	 *
	 * Curate events object so they can easily be implemented in to templates.
	 *
	 * @since version 1.6.0
	 */
	function sanitize_events() {

		// Available Events
		$events = $this->get_events([
            'eventDisplay'   => 'custom',
            'posts_per_page' => 10,
            'start_date'     => 'now'
        ]);
		$eventsList = [];

		// no event/s found
		if( ! $events || ! isset($events) || count($events) < 1 ):
			return null;
		endif;

		$wooTickets = $this->can_lookup_woo_tickets()
        ? \Tribe__Tickets_Plus__Commerce__WooCommerce__Main::get_instance()
        : null;

		// check for required properties
		foreach ( $events as $event ) {
			if( isset($event->ID) ):

        // event dates
        $raw_start = tribe_get_start_date( $event, false, 'Y-m-d H:i:s' );
        $raw_end   = tribe_get_end_date(   $event, false, 'Y-m-d H:i:s' );

        $start_dt = date_create( $raw_start );
        $end_dt   = date_create( $raw_end );

				// get the event thumbnail image
				$eventImage = ( function_exists('get_post_thumbnail_id') )
							? get_post_thumbnail_id($event->ID) // Retrieve the image ID
							: null;

				array_push($eventsList, [
					'title'			=> ( isset($event->post_title) )
									? $event->post_title
									: '',

					'excerpt' 		=> ( isset($event->post_content) && function_exists('wp_trim_words') && function_exists('get_permalink') )
									? wp_trim_words( $event->post_content, 55, '... <a href="' . get_permalink($event->ID) . '">Read More</a>' )
									: '',

					'posters' 		=> ( $eventImage ) ? [
										'xl' => ( function_exists('wp_get_attachment_image_url') )
												? wp_get_attachment_image_url( $eventImage, 'full' )
												: '',
										'sm' => ( function_exists('wp_get_attachment_image_url') )
												? wp_get_attachment_image_url( $eventImage, 'medium' )
												: ''
									] : null,

					'starting-datetime'	=> [
						'date' => date_format( $start_dt, "D M j" ),
            'time' => date_format( $start_dt, "g:i a" ),
					],
					'ending-datetime' 	=> [
						'date' => date_format( $end_dt,   "D M j" ),
            'time' => date_format( $end_dt,   "g:i a" ),
					],

					// ticket properties
					'tickets' => ( $wooTickets && isset($wooTickets) )
								? $wooTickets->get_tickets_ids( $event->ID )
								: null
				]);
			endif;
		}

		// return the curated listed
		return $eventsList;
	}

	/**
	 * SANITIZE TICKETS
	 *
	 * Curate tickets object so they can easily be implemented in to templates.
	 *
	 * @since version 1.6.0
	 */
	function sanitize_tickets( $ticket ) {
		// tickets to exclude from tickets only page
		$vipList = $this->get_vip_list();

		// list of all details in ticket
		$ticketsDetails = [];

		// Checks for wooCommerce
		if ( ! $this->can_lookup_woo_tickets() || ! function_exists('wc_get_product') ):
			return $ticketsDetails;
		endif;

		// Checks if tickets can be accessed
		if( ! wc_get_product( $ticket ) ):
			return [];
		endif;

		// the selected ticket
		$selectedTicket = wc_get_product( $ticket );

		// The name of the targeted ticket
		$name = $selectedTicket->get_name();

		if ( $name && ! in_array( $name, $vipList ) ):
			// Get price as a float
			$price = (float) $selectedTicket->get_price();

			$ticketsDetails = [
				'id'           => $ticket,
				'name'         => $name,
				'stocks'       => [
					'status'	=> $selectedTicket->get_stock_status(), // the status of the stock
					'quantity'	=> $selectedTicket->get_stock_quantity(), // the number of stocks remaining
				],
				'price'        => [
					'dollars' 		=> floor( $price ), // Whole dollar amount
					'cents'   		=> round( ( $price - floor( $price ) ) * 100 ), // Cents part
					'totalPrice'	=> $selectedTicket->get_price()
				]
			];
		endif;

		return $ticketsDetails;
	}

	function generateEventTemplates() {
		$events = $this->sanitize_events();
		$eventTemplates = '';

		// if $events is not an array or has no items, short-circuit
        if (!is_array($events) || count($events) < 1) {
            $html  = '<p>No Events are currently listed, please check back at a later date.</p>';
            if (!function_exists('tribe_get_events')
                && (current_user_can('administrator')
                    || current_user_can('editor'))
            ) {
                $html .= '<div class="admin_page_notes">'
                    . 'Please install the events calendar to enable this page.'
                    . '</div>';
            }
            return $html;
        }

		foreach( $events as $event ) {
			$title				= $event['title'];						// A Single event title
			$excerpt 			= $event['excerpt'];					// A Single event excerpt
			$tickets			= $event['tickets'];					// A Single event ticket options
			$endDate			= $event['ending-datetime']['date'];	// A Single event start date options
			$endTime			= $event['ending-datetime']['time'];	// A Single event start time options
			$startDate			= $event['starting-datetime']['date'];	// A Single event start date options
			$startTime			= $event['starting-datetime']['time'];	// A Single event start time options
			$largePoster		= $event['posters']['xl'];				// A Single even Lager poster
			$smallPoster		= $event['posters']['sm'];				// A Single even Small poster
			//$curatedTickets		= [];
			$ticketsTemplates	= [];

            $tickets = $event['tickets'] ?? [];
            if (! is_array($tickets)) {
                $tickets = [];
            }

                    $curatedTickets = array_map(
                fn($ticketID) => $this->sanitize_tickets($ticketID),
                $tickets
            );

            usort($curatedTickets, function($a, $b){
                return $a['price']['totalPrice'] <=> $b['price']['totalPrice'];
            });

			// for each tickets create a ticket template
			foreach ( $curatedTickets as $curatedTicket ) {
				array_push( $ticketsTemplates, $this->TicketsTemplate([
					'id' 		=> $curatedTicket['id'],
					'name' 		=> $curatedTicket['name'],
					'stocks'	=> $curatedTicket['stocks'],
					'price' 	=> $curatedTicket['price'],
					'form'		=> [
						'method' 			=> 'POST',
						'action' 			=> ( function_exists('site_url') )? site_url('/cart/') : null,
						'enctype'			=> "multipart/form-data",
						'data-provider'		=> "Tribe__Tickets_Plus__Commerce__WooCommerce__Main",
						'autocomplete'		=> "off",
						'novalidate'		=> true,
						'data-provider-id'	=> "woo"
					]
				]));
			}

			// create the event template
			$eventTemplates		.= $this->eventTemplate([
				"age"				=> "",
				"title" 			=> $title,
				"price" 			=> ( isset($curatedTickets[0]['price']['totalPrice']) )
									? $curatedTickets[0]['price']['totalPrice']
									: '',
				"posterUrl"			=> $largePoster,
				"ending-time"		=> "$endDate at $endTime",
				"starting-time"		=> "$startDate at  $startTime",
				"ticketsTemplates"	=> ( isset($ticketsTemplates) && !empty($ticketsTemplates) && count($ticketsTemplates) >=1 )
									? $ticketsTemplates
									: []
			]);
		}

		return $eventTemplates;
	}

	/**
	 * Helper function to log debug messages.
	 */
	function log_debug($msg) {
		if ( defined('WP_DEBUG') && WP_DEBUG ) {
			error_log("[RhythmzTicketsGenerator] " . $msg);
		}
	}

	// Convert abbreviated month (e.g., "Jan") to numeric value (1).
	function alpha_month_to_num( $alpha_month ) {
		$months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		$alpha_month = ucfirst(strtolower($alpha_month));
		$index = array_search($alpha_month, $months);
		return ($index !== false) ? $index + 1 : null;
	}

	// Safely convert a string to an integer.
	function string_to_int( $get_string ) {
		$string = (int)$get_string;
		return is_int($string) ? $string : 0;
	}

	function ticketsTemplate($ticket = [
		'id' 		=> '',
		'name' 		=> '',
		'price' 	=> ['dollars' => '10', 'cents' => '00', 'totalPrice' => '0.00'],
		'stocks'	=> ['status' => 'outofstock', 'quantity' => '0'],
		'form'		=> [
			'method' 			=> 'POST',
			'action' 			=> '',
			'enctype'			=> "multipart/form-data",
			'data-provider'		=> "Tribe__Tickets_Plus__Commerce__WooCommerce__Main",
			'autocomplete'		=> "off",
			'novalidate'		=> true,
			'data-provider-id'	=> "woo"
		]
	]) {
		// Property checks and fallbacks
		$ticket['id'] = isset($ticket['id']) ? $ticket['id'] : '';
		$ticket['name'] = isset($ticket['name']) ? $ticket['name'] : '';

		$ticket['price'] = isset($ticket['price']) ? $ticket['price'] : ['dollars' => '0', 'cents' => '00', 'totalPrice' => '0.00'];
		$ticket['price']['dollars'] = isset($ticket['price']['dollars']) ? $ticket['price']['dollars'] : '0';
		$ticket['price']['cents'] = isset($ticket['price']['cents']) ? $ticket['price']['cents'] : '00';
		$ticket['price']['totalPrice'] = isset($ticket['price']['totalPrice']) ? $ticket['price']['totalPrice'] : '0.00';

		$ticket['stocks'] = isset($ticket['stocks']) ? $ticket['stocks'] : ['status' => 'outofstock', 'quantity' => '0'];
		$ticket['stocks']['status'] = isset($ticket['stocks']['status']) ? $ticket['stocks']['status'] : 'outofstock';
		$ticket['stocks']['quantity'] = isset($ticket['stocks']['quantity']) ? $ticket['stocks']['quantity'] : '0';

		$ticket['form'] = isset($ticket['form']) ? $ticket['form'] : ['method' => '', 'action' => ''];
		$ticket['form']['id'] = isset($ticket['form']['id']) ? $ticket['form']['id'] : '';
		$ticket['form']['method'] = isset($ticket['form']['method']) ? $ticket['form']['method'] : '';
		$ticket['form']['action'] = isset($ticket['form']['action']) ? $ticket['form']['action'] : '';
		$ticket['form']['enctype'] = isset($ticket['form']['enctype']) ? $ticket['form']['enctype'] : '';
		$ticket['form']['data-provider'] = isset($ticket['form']['data-provider']) ? $ticket['form']['data-provider'] : '';
		$ticket['form']['autocomplete'] = isset($ticket['form']['autocomplete']) ? $ticket['form']['autocomplete'] : '';
		$ticket['form']['novalidate'] = (isset($ticket['form']['novalidate']) && $ticket['form']['novalidate'] === true) ? 'novalidate':'novalidate';
		$ticket['form']['data-provider-id'] = isset($ticket['form']['data-provider-id']) ? $ticket['form']['data-provider-id'] : '';

		// Ensure this is a valid WooCommerce product
        if (! function_exists('wc_get_product')) {
        return '';
        }
        $product = wc_get_product($ticket['id']);
        if (! $product instanceof \WC_Product) {
        return '';
        }

		// input setup
		$defaults = array(
			'id'				=> "ticket_qty_{$ticket['id']}",
			'step'				=> apply_filters('woocommerce_quantity_input_step', '1', $ticket['id']),
			'input_class'		=> 'input user-stock',
			'max_value'			=> apply_filters('woocommerce_quantity_input_max', '5', $ticket['id']),
			'min_value'			=> apply_filters('woocommerce_quantity_input_min', '0', $ticket['id']),
			'input_name'		=> 'quantity',
			'input_value'		=> '0',
			'placeholder'		=> 'Quantity',
			'data-stock'		=> $ticket['stocks']['quantity'],
			'data-stock-status'	=> $ticket['stocks']['status']
		);

        // Generate quantity input with real product
        $quantity_input = woocommerce_quantity_input($defaults, $product, false);

		// Template generation
		$template = "<form id = 'ticket-form-" . htmlspecialchars($ticket['id']) . "'
		class				= 'ticket'
		method				= '" . htmlspecialchars($ticket['form']['method']) . "'
		action				= '" . htmlspecialchars($ticket['form']['action']) . "'
		enctype				= '" . htmlspecialchars($ticket['form']['enctype']) . "'
		autocomplete		= '" . htmlspecialchars($ticket['form']['autocomplete']) . "'
		data-provider		= '" . htmlspecialchars($ticket['form']['data-provider']) . "'
		data-provider-id	= '" . htmlspecialchars($ticket['form']['data-provider-id']) . "'
		" . htmlspecialchars($ticket['form']['novalidate']) . ">

			<span class='ticket-info'></span>

			<ul class='product'>

				<li class='details'
					data-stock='" . htmlspecialchars($ticket['stocks']['quantity']) . "'
					data-stock-status='" . htmlspecialchars($ticket['stocks']['status']) . "'
				>
					<span class='name'>". htmlspecialchars($ticket['name']) . "</span>
					<span class='cost-per-ticket'>1 x $". htmlspecialchars($ticket['price']['totalPrice']) . "</span>
				</li>

				<li class='user-price' data-price='". htmlspecialchars($ticket['price']['totalPrice']) . "'>
					<span class='dollars'>$0</span>
					<sup class='cents'>.00</sup>
				</li>

				<li class='fields'>
					<label for='add-ticket' hidden>Add tickets</label>
					<button class='btn sub-ticket' name='add-ticket' type='button'>-</button>
					<label for='quantity' hidden>Number of tickets</label>
					" . $quantity_input . "
					<label for='remove-ticket' hidden>Number of tickets</label>
					<button class='btn add-ticket' name='remove-ticket' type='button'>+</button>
				</li>

			</ul>

			<div class='submit-container'>
				<button type='submit' class='submit' name='add-to-cart' value='{$ticket['id']}'>
					<i class='fa fa-cart-plus' aria-hidden='true'></i> Add to Cart
				</button>
			</div>
        </form>";

		return $template;
	}

	function eventTemplate($event = [
		"age" => "21+",
		"title" => "Untitled Event",
		"price" => "0",
		"posterUrl" => "default-poster.jpg",
		"ending-time" => "TBD",
		"starting-time" => "TBD",
		"ticketsTemplates" => []
	]) {
		// Property Validations
		$event['age'] = isset($event['age']) ? $event['age'] : '21+';
		$event['title'] = isset($event['title']) ? $event['title'] : 'Untitled Event';
		$event['price'] = isset($event['price']) ? $event['price'] : '0';
		$event['posterUrl'] = isset($event['posterUrl']) ? $event['posterUrl'] : '';
		$event['starting-time'] = isset($event['starting-time']) ? $event['starting-time'] : 'TBD';
		$event['ending-time'] = isset($event['ending-time']) ? $event['ending-time'] : 'TBD';
		$event['ticketsTemplates'] = isset($event['ticketsTemplates']) ? $event['ticketsTemplates'] : [];

		// Generate Tickets HTML
		$ticketsHTML = '';
		if (is_array($event['ticketsTemplates'])) {
			foreach ($event['ticketsTemplates'] as $ticket) {
				$ticketsHTML .= "$ticket";
			}
		} else {
			$ticketsHTML .= $event['ticketsTemplates'];
		}

		// Template generation
		$template = "<div class='event'>
			<aside class='flyer'>
				<span class='event-image' style='background-image: url({$event['posterUrl']});'>
					<header class='header'>
						<span class='info starting-price cost'>$" . htmlspecialchars($event['price']) . "+</span>
						<span class='info age'>{$event['age']} Event</span>
					</header>
				</span>
			</aside>
			<article class='tickets-area'>
				<section class='tickets-btn'>
					<span class='left'>
						<small><b>Event:</b> " . htmlspecialchars($event['title']) . "</small>
						<small><b>Date:</b> " . htmlspecialchars($event['starting-time']) . "</small>
					</span>
					<span class='right'><i class='fa-solid fa-chevron-down'></i></span>
				</section>
				<span class='notifications'></span>
				<div class='tickets'>$ticketsHTML</div>
			</article>
		</div>
		";

		return $template;
	}
}

// Register Event tickets
//$ticketsGenerator = new Events();
//$ticketsGenerator->register_rhythmz_tickets();