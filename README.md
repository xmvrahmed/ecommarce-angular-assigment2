# FreshCart

FreshCart is an Angular storefront built around the Route E-commerce API. It includes a responsive home page, product and collection browsing, authentication flows, a product detail view, cart and wishlist management, checkout, and order history.

## Run locally

```bash
npm install
npm start
```

The app runs at `http://localhost:4200`. Create a production build with `npm run build`.

## Store pages

- `/` — home, categories, featured products, and popular brands
- `/products` and `/products/:id` — searchable/sortable catalog and product details
- `/categories`, `/categories/:id`, `/subcategories/:id`, `/brands`, and `/brands/:id` — collection listings and filtered details
- `/login`, `/register`, `/forgot-password`, `/verify-reset-code`, `/reset-password`, and `/change-password`
- `/cart`, `/checkout`, `/wishlist`, `/orders`, and `/contact`

Guest cart, wishlist, and cash orders are stored in browser local storage. Signing in enables the authenticated cart, wishlist, account, and order API operations. Online checkout uses the API payment session and requires an authenticated account.

The contact form prepares a message in the visitor's default email app; social sign-in and promo-code validation are not provided by the configured API.

## API

The API base URL is `https://ecommerce.routemisr.com/api/v1`. The app uses the products, categories, brands, authentication, user password, cart, wishlist, and orders endpoints.

Reference documentation: [Route E-commerce App API](https://documenter.getpostman.com/view/5709532/2s93JqTRWN).
