This content is coming from: https://docs.plasmic.app/learn/code-components/




Writing code components for use with Plasmic
Often, you can just directly register your usual code components as-is for use with Plasmic. This works great for any design systems components or presentational components you already have.

But if you are tailoring components explicitly to be used with Plasmic, you can make them better integrated with the Studio by using these additional APIs or following these tips.

Allow positioning and styling via className prop
If your code component renders some DOM elements, then you should allow your Studio users to have some control over its styling — for example, setting its width and height, its alignment in a flex container, etc.

To do so, your component should expose a className prop that is passed onto the root DOM element:

Copy
function MyComponent({ className }: { className?: string }) {
  return <div className={className}>{/* ... other stuff goes here */}</div>;
}
This only styles the root element (instead of any arbitrary element in your code component). Usually that makes sense — your component should already come with its own styles and layout, and usually you only want to allow positioning-related styles to be set on the root element.

Detect if your component is rendering in Plasmic Studio
You might want to disable some functionality inside the component when it is used inside Plasmic Studio artboards — for example, disable slow scroll animations, videos, or certain compute-heavy effects.

For that reason, we provide a React context PlasmicCanvasContext whose value is true only when the component is rendering in the Editor.


Next.js

Gatsby

Plain React

Loader

Codegen
components/MyComponent.tsxCopy
import { PlasmicCanvasContext } from '@plasmicapp/loader-nextjs';
import { SomeComponent }
function MyComponentWrapper() {
  const inEditor = useContext(PlasmicCanvasContext);
  return <MyComponent animated={!inEditor} />;
}
Sometimes, it makes sense to even expose a prop for your component that Plasmic users can toggle to turn certain features on and off:


Next.js

Gatsby

Plain React

Loader

Codegen
components/MyComponent.tsxCopy
import { PlasmicCanvasContext } from '@plasmicapp/loader-nextjs';
function MyComponentWrapper(props: {showAnimation: boolean}) {
  const inEditor = useContext(PlasmicCanvasContext);
  
  // Show animation if not used in Plasmic, or if Plasmic user explicitly
  // asks to show animation
  return <MyComponent animated={!inEditor || props.showAnimation} />;
}
Communicate between components via React Contexts
Your code components can communicate with each other through React Contexts. One common pattern is for one code component to fetch and provide some data via a React Context, and for other code components to read from that Context and display a piece of that data.

For example, here we have a component ProductProvider that fetches and provides data for a product, and components like ProductTitle or ProductPrice that renders the product title and price:

Copy
const ProductContext = React.createContext<Product | undefined>(undefined);

function ProductProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const data = useFetchProductData(props.slug);
  return <ProductContext.Provider value={data}>{children}</ProductContext.Provider>;
}

function ProductTitle({ className }: { className?: string }) {
  const product = React.useContext(ProductContext);

  // Use a default string in case this component is used outside of ProductContext
  const title = product?.title ?? 'Product Title';
  return <div className={className}>{title}</div>;
}

function ProductPrice({ className }: { className?: string }) {
  const product = React.useContext(ProductContext);

  const price = product?.price ?? 100;
  return <div className={className}>{formatCurrency(price)}</div>;
}
Repeating slot content for each element of a list
One important use of code components is for fetching and using dynamic data from your own data store. Often, you will fetch a collection of something, and would like to repeat the slot content once for every element in the collection. For example, you might have fetched a list of products, and want to render something once per product.

To do this, use the repeatedElement() function. This ensures an editing experience in Plasmic Studio where the user can select and make edits just the first replica of the slot contents.


Next.js

Gatsby

Plain React

Loader

Codegen
components/ProductCollection.tsxCopy
import { repeatedElement } from '@plasmicapp/loader-nextjs';
import { ProductContext } from './ProductContext.tsx';

function ProductCollection({
  collectionSlug,
  children,
}: {
  children?: ReactNode;
  collectionSlug?: string;
}) {
  const data = useFetchProductCollection(collectionSlug);
  return (
    <>
      // Repeat whatever is in the "children" slot, once for every product.
      // But wrap the slot content in a ProductContext.Provider, so that
      // the slot content can look up what product it is for by reading
      // from ProductContext.
      {data?.productList.map((productData, i) => (
        <ProductContext.Provider value={productData} key={productData.id}>
          {repeatedElement(i, children)}
        </ProductContext.Provider>
      ))}
    </>
  );
}
The repeatedElement function expects two parameters: a boolean isPrimary and a React node elt:

isPrimary: Indicates the primary copy to be edited in the editor (usually the first copy). Should be true for only one of the copies.
elt: The element to be cloned. If the value provided is not a valid ReactElement, the original value is returned. Otherwise, React.cloneElement is used to clone the element, applying required tweaks to elements from the Editor.
Learn more about incorporating dynamic data into your Plasmic designs.

Applying global themes / contexts to code components
Since your code components are rendered on your host page, it will have access to whatever CSS or React contexts that exist on the host page. So if your code components require contexts to work, simply make sure they are provided when rendering PlamsicCanvasHost:

Copy
<ThemeContext.Provider>
  <PlasmicCanvasHost />
</ThemeContext.Provider>
Any component instances used in your Plasmic designs will have access to the context as per usual.

Custom behaviors (attachments)
You may want your code components to be used as wrapper components (like animations, effects, behaviors, etc). To do that, you can register them as “attachments”, and they will be available on the right panel of Studio, in the Custom behaviors section.

Notice that these components can have any number of props, but can only have a single slot prop called “children”.

For example,

Copy
// Registering MyAnimation as an attachment
registerComponent(MyAnimation, {
  name: 'My Animation',
  isAttachment: true,
  props: {
    maxAngleX: 'number',
    maxAngleY: 'number',
    color: 'string',
    children: 'slot'
  }
});
See our custom behaviors page for more information.

Applying Plasmic styles to parts of your component
Normally, Plasmic isolates its styles from your code.

However, you can choose to apply Plasmic’s styles—in particular its default styles for text, h1, etc.—to your codebase by taking a themeResetClass and applying this to the element(s) you want.

One situation where this is useful is when you’re trying to render some generic HTML content that came from Markdown, a CMS, etc., but with styles defined in Plasmic.

Copy
function Modal({ themeResetClass, className, modalContent }) {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <button className={className} onClick={() => setShow(true)}>
        Show
      </button>
      {ReactDOM.createPortal(<div className={`modal ${themeResetClass}`}>{modalContent}</div>, document.body)}
    </>
  );
}

registerComponent(Modal, {
  name: 'Modal',
  props: {
    modalContent: 'slot',
    themeResetClass: {
      type: 'themeResetClass'
    }
  }
});
Viewport height elements
If you are creating a component that uses a full screen height element, then these won’t work with design mode artboards, since these artboards grow their own height dynamically to fit the size of the page—yet the size of the page will be pushed taller since this one element in the page now thinks it will need to grow into the available space, and so on forever.

You can either:

Stick to normal editing mode instead of using design mode
Or, you can define a CSS custom property, --viewport-height: 100vh in your :root, and use var(--viewport-height) instead of 100vh in your designs. In the canvas artboard, Plasmic will override --viewport-height to the appropriate (configurable) fixed height.
Or, otherwise detect when you are within the Plasmic canvas (using usePlasmicCanvasContext()) and render something that is not.
Note: vh elements are not the only issue. It’s also possible to have, say, an element near the root of the page that is set to height: 100%.

Data-fetching code components
Continue reading onto the next section to learn how to fetch data from your own data backends in a way that works with SSR/SSG.





Using DataProvider to provide data to Plasmic Studio
Your code components can make data available to Plasmic Studio users, so that they can use it in dynamic value expressions. This is done via the <DataProvider /> component, which is based on React contexts.

This is most commonly used within code components that fetch data from some API, but can also be used to provide any other kind of data (such as pure client-side state).

Providing data with DataProvider
Here’s an example of a code component that fetches product info for a specific product slug:


Loader

Codegen
Copy
import { DataProvider } from "@plasmicapp/host"; // or "@plasmicapp/loader-*"

function ProductBox(props: { children?: ReactNode; className?: string; productSlug?: string }) {
  const { children, className, productSlug } = props;

  // Some hook that you've defined for fetching product data by slug
  const response = useFetchProduct(productSlug);
  return (
    <div className={className}>
      {
        // Make this data available to this subtree via context,
        // with the name "product"
      }
      <DataProvider name="product" data={response.data}>
        {children}
      </DataProvider>
    </div>
  );
}
The above component fetches product data using your own data-fetching React hook, and makes that data available via the special <DataProvider /> component. <DataProvider/> will then make the data available via React context, so that elements in the children will be able to read it.

You can either consume the data from other code components (such as a ProductTitle, ProductImage—see next section), or directly in Plasmic Studio using dynamic value expressions.

In order for <DataProvider /> to work, you need to set the parameter providesData in component registration:

Copy
registerComponent(ProductBox, {
  name: "Product Box",
  providesData: true,
  ...
})
Reading fetched data from code components
You can create code components that read data provided via <DataProvider/> by other components, using the useSelector() hook.

For example, here’s a code component that reads the product fetched above, and renders its title:


Loader

Codegen
Copy
import { useSelector } from "@plasmicapp/host"; // or "@plasmicapp/loader-*"

function ProductTitle(props: { className?: string }) {
  const { className } = props;

  // Selects data named "product"
  const product = useSelector("product");
  return <div className={className}>{product?.title ?? "Product Title"}</div>;
}
This component uses the useSelector() hook to look up data that was provided with the name “product”. It then either renders the product title, if it has been fetched, or the fallback value of “Product Title” if it can’t be found in the context or is not ready yet.

DataProvider vs normal React context
Should you use <DataProvider /> or a normal React context? That depends on your use case. If what you are providing is data that the Plasmic user should have access to from the data picker to build dynamic value expressions, then you should use <DataProvider/>. If instead it is internal data that is only used by your code components to communicate with each other, then you should use a custom React context.

Using fetched data in dynamic value expressions
<DataProvider/> is more than just a normal React context provider though — it is a special context provider that the Plasmic Studio understands. When you provide data using <DataProvider />, that piece of data is also available for dynamic value expressions.

For example, now the Plasmic user will be able to see product in the data picker:

Using product data in data picker
or write a code expression referencing it. All data provided by the <DataProvider /> is available under the special $ctx object by its provided name:

Using product data in code expression
<DataProvider/> API
Prop	Required?	Description
name	Yes	Variable name for the data; must be a valid javascript identifier; users will see this name in the data picker, and can reference this as code expressions as $ctx.name
data	Yes	Data to provide; can be undefined if not available
hidden	No	Hides the variable from the data picker UI and $ctx; useful when you are providing data that your other code components may want to consume, but that you don’t want the user to use directly
label	No	A nicer human-friendly label that will be used instead in the data picker UI
children	Yes	React tree that will have access to the provided data



Querying data with code components
One powerful way to extend Plasmic is to create code components that can fetch and render arbitrary data from any data source, including your own product API. This makes it possible to build designs in Plasmic that will be using the same data sources that your production application uses.

Plasmic also provides a simple framework for convenient fetching at pre-render time (during static site generation or server side rendering), so that your pages can be rendered with the data already available, and without incurring any browser-side network requests. However, if the fetch has any runtime dependencies (such as on some React state), it can also fetch data at runtime.

Summary
This code shows how to write a code component that can fetch data at pre-render (SSG/SSR) time and provide that data to its descendants.

Highlights:

It can fetch data at pre-render time (SSR/SSG).
It can also re-fetch data at runtime if needed (e.g. if it depends on some React state).
It can depend on props that vary from instance to instance or at runtime.
Simply insert this component anywhere, without needing to update a page-level method like getStaticProps/getServerSideProps.
DataProvider makes the data usable in Plasmic Studio via dynamic value expressions, or from other code components.
Copy
export function TweetsProvider({ children }: { children: React.ReactNode }) {
  const { data } = usePlasmicQueryData('/tweets', async () => {
    const resp = await fetch('https://studio.plasmic.app/api/v1/demodata/tweets');
    return await resp.json();
  });

  return (
    <>
      {data && (
        <DataProvider name="tweets" data={data}>
          {children}
        </DataProvider>
      )}
    </>
  );
}
Fetching data from your code components
You can fetch your data in your code component however you’d like, but we recommend using hooks provided by Plasmic to fetch data in a way that works with both server-side rendering and static site generation.

Plasmic provides a usePlasmicDataQuery() hook that has a similar API as useSWR() from swr or useQuery() from react-query, taking in a data key and an async fetching function. You can use it fetch data from your code components, like this:


Loader

Codegen
components/TweetsProvider.tsxCopy
import { usePlasmicQueryData } from '@plasmicapp/loader-nextjs';
export function TweetsProvider(props: {children: React.ReactNode}) {
  const {children} = props;
  const {data} = usePlasmicQueryData("/tweets", async () => {
    const resp = await fetch("https://studio.plasmic.app/api/v1/demodata/tweets");
    return await resp.json();
  });
  if (!data) {
    return null;
  }
  return (
    <DataProvider name="tweets" data={data}>
      {children}
    </DataProvider>
  );
}
Pre-rendering query data
Often, you would want to perform all the data-fetching at build time, so that the queried data will be embedded in the html, and your pages will render without having to wait for a data fetch. Plasmic provides a extractPlasmicQueryData() function that allows you to extract data queried using usePlasmicQueryData() from a React element tree. You can use it at build time to extract the necessary data, then provide the pre-fetched data via a context into your app.

For example, for Next.js, you would do the data fetching in getStaticProps(), like so:


Loader

Codegen
Copy
import { PLASMIC } from "../plasmic-init";
import { extractPlasmicQueryData, PlasmicRootProvider, PlasmicComponent } from "@plasmicapp/loader-nextjs";

// Pre-fetching
export function getStaticProps({params}) {
  const plasmicData = await PLASMIC.fetchComponentData("Home");
  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageParams={params}
    >
      <PlasmicComponent component="Home" componentProps={...} />
    </PlasmicRootProvider>
  );
  return {
    props: {plasmicData, queryCache}
  };
}

// Rendering page
export function HomePage({plasmicData, queryCache}) {
  const pageMeta = plasmicData.entryCompMetas[0];
  const router = useRouter();
  return (
    <PlasmicRootProvider
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageParams={router.params}
    >
      <PlasmicComponent component="Home" componentProps={...} />
    </PlasmicRootProvider>
  );
}
How extractPlasmicQueryData() works
We extract data from your React element tree by running react-ssr-prepass, which is a technique for “fake-rendering” a React element tree by using a fake React runtime. This runtime can detect fetches performed by usePlasmicQueryData() (as thrown promises), wait for those fetches to resolve, and save the results into a cache. This cache can then be used at render time; usePlasmicQueryData() will only actually perform a fetch if the data it wants is not in this cache.

Note that the element tree you pass into extractPlasmicQueryData() doesn’t need to be exactly like what you’re actually rendering for the final page; it just needs to render enough to fire off all the data fetches you need to do. But because this “prepass rendering” phase is happening in a fake React runtime, and not the usual Next.js runtime, you may need to take care of a few things:

If you have code components that read from your React contexts, and the context providers are in places like _app.tsx, you’ll need to either also need to include the context providers in your extractPlasmicQueryData() call, or make sure your code components can work correctly when those context values are not provided.

If you have code components that use useRouter(), this will thrown an error in the fake runtime. See next section for workarounds!

Workarounds for useRouter()
If you’re using Next.js, then during prepass, you may see an error like this:

Copy
PLASMIC: Encountered error when pre-rendering SOME_COMPONENT: Error: invariant expected app router to be mounted
or something similar. The reason is that you have code components that calls useRouter() but the Next.js router is not mounted in the element tree you’re passing into extractPlasmicQueryData(), resulting in this error. This doesn’t completely break extractPlasmicQueryData(); it just means it won’t be able to extract query data from rendering SOME_COMPONENT.

There are a few workarounds for this:

If you have no data fetching going on within SOME_COMPONENT, then you can just ignore the warning.
If you do have data fetching beneath this code component tree, but the information from useRouter() does not impact the data that’s fetched, then you can define something like this, and replace useRouter() with useSafeRouter(), and have your code component handle the case when useSafeRouter() returns undefined:
Copy
export function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return undefined;
  }
}
If your code component does perform data fetches that relies on information from useRouter(), then you’ll need to get the url params through some other means. For example, if you followed the instructions above and passed in the pageParams prop into <PlasmicRootProvider/>, then you can access them like this:
Copy
import { useSelector } from '@plasmicapp/loader-nextjs';
export function useSafeParams() {
  const dataCtxParams = useSelector('params');
  try {
    return useRouter().params;
  } catch {
    return dataCtxParams;
  }
}
Common data-fetching code component patterns
Rendering a wrapping DOM element
In the above example, the ProductBox component renders a wrapping <div/> for its children. This is sometimes convenient because this wrapping <div/> can then serve as a natural place to layout the content. However, you may prefer for your data-fetching component to not render any DOM; in that case, the content will be laid out by the parent element.

Copy
function ProductBox(props) {
  const { children, productSlug } = props;
  const response = useFetchProduct(productSlug);
  // Render <DataProvider /> without wrapping div
  return (
    <DataProvider name="product" data={response.data}>
      {children}
    </DataProvider>
  );
}
You can also make this a choice for your user by taking in a prop:

Copy
function ProductBox(props) {
  const { children, productSlug, noLayout, className } = props;
  const response = useFetchProduct(productSlug);

  let content = (
    <DataProvider name="product" data={response.data}>
      {children}
    </DataProvider>
  );

  if (props.noLayout) {
    return content;
  } else {
    return <div className={className}>{content}</div>;
  }
}
Automatically repeat collection items
If your data fetcher is fetching a collection of items, it may be convenient for your user to automatically repeat the children using repeatElement:

Copy
function ProductCollection(props: { collectionSlug: string; children?: React.ReactNode }) {
  const { collectionSlug, children } = props;
  const data = useFetchProductCollection(collectionSlug);
  return (
    <>
      {data?.productList.map((product, i) => (
        <DataProvider name="currentProduct" data={product} key={i}>
          {repeatedElement(i, children)}
        </DataProvider>
      ))}
    </>
  );
}
However, sometimes you may want to give the user more control over what content to repeat, or perhaps the data you fetched contains more than just the repeatable collection; it may also include collection name, count of items, and other things that your user may want to use in dynamic data expressions. In that case, you should provide the whole collection, and let the user perform the repetition within the Plasmic studio instead.

Again, you could also leave it up to the user by using a prop:

Copy
function ProductCollection(props: { collectionSlug: string; children?: React.ReactNode; noAutoRepeat?: boolean }) {
  const { collectionSlug, children, noAutoRepeat } = props;
  const data = useFetchProductCollection(collectionSlug);
  return (
    <DataProvider name="collection" data={data}>
      {noAutoRepeat
        ? children
        : data?.productList.map((product, i) => (
            <DataProvider name="currentProduct" data={product} key={i}>
              {repeatedElement(i, children)}
            </DataProvider>
          ))}
    </DataProvider>
  );
}
Single code component vs family of components
Let’s say you want to drop in a section of your landing page that displays product data from your catalog. (You can extend this example to your own situation, such as displaying blog posts from a CMS.)

One approach is to create a single component for that entire section. Content editors can drop in this whole component and customize it via its props, but not edit the design or layout of how the data is shown, as this will all be hard-coded. (This is the example shown on the code components demo site.) This is a great common way to get started, and is sometimes the approach you achieve in CMSes.

data product
Alternatively, you can create a family of components, representing individual pieces of data that Plasmic Studio users can assemble together to create custom designs or layouts of how the entire section is presented. In this scenario, you might create:

A ProductBox component that fetches the data and makes it available in a React Context to its slot children.
Components for ProductTitle, ProductImage, ProductPrice, ProductDescription, ProductAddToCartButton, etc. Users would drop these anywhere within a ProductBox to make it work.
Or even a generic ProductTextField component that (via a prop) lets the user choose which product data field they want to display.
data product box
This even works for repeated elements. You can create a ProductCollection component that takes its children slot contents and repeats it using repeatedElement(). This lets you display a whole collection of products, each of which is rendered using the exact arrangement of ProductTitle, ProductImage, etc. that Plasmic Studio users design.

data product collection
Copy
import { repeatedElement } from '@plasmicapp/react-web/lib/host';

const ProductCollection = ({
  collectionSlug,
  children,
  className
}: {
  children?: ReactNode;
  className?: string;
  collectionSlug?: string;
}) => {
  const data = useFetchProductCollection(collectionSlug);
  return (
    <div className={className}>
      {data?.productList.map((productData, i) => (
        <DataProvider name="product" data={productData} key={productData.id}>
          {repeatedElement(i, children)}
        </DataProvider>
      ))}
    </div>
  );
};

/** Or to display a single product */
const ProductBox = ({
  productSlug,
  children,
  className
}: {
  children?: ReactNode;
  className?: string;
  productSlug?: string;
}) => {
  const data = useFetchProduct(productSlug);
  return (
    <div className={className}>
      <DataProvider name="product" data={data?.productData}>
        {children}
      </DataProvider>
    </div>
  );
};

const ProductTitle = ({ className }: { className?: string }) => {
  const productData = useSelector('product');
  return (
    <div className={className}>{productData?.title ?? 'This must be inside a ProductCollection or ProductBox'}</div>
  );
};

const ProductImage = ({ className }: { className?: string }) => {
  // ...
};
Fetching from your own APIs
Generally, this approach works well for APIs that are third-party.

What if you want to query your own API handlers in a framework like Next.js (under /api)?

If you are performing SSR (e.g. getServerSideProps), then you can still make the call, but node fetch will require fully qualified URLs—rather than query /api/foo, you’ll need to query https://example.com/api/foo or http://localhost:3000/api/foo to query via loopback device (ideally, this hostname should be externally supplied by the environment).

If you are performing SSG (e.g. getStaticProps), the API handlers will not even be running! So instead of querying your own /api, you can instead directly execute the handlers your API routes bind to.

What if you need to keep this isomorphic so that the components can query from both browser and SSG? Say for instance you are performing a Postgresql database query. It is bound to /api/query and lives in a handler function query(). You cannot simply define a function isomorphicQuery() that checks if window is defined and switch between the two - the database modules like pg will end up getting bundled with your client code. You will need to inject this as a dynamic dependency, e.g. via React context.

So for instance:

In getStaticProps, in extractPlasmicQueryData, use:

Copy
<QueryContext.Provider value={{query: () => pg.query()}}>
In your render function, provide a normal fetch to your /api:

Copy
<QueryContext.Provider value={{query: () => fetch('/api/query', {...opts})}}>
In your data fetching code component:

Copy
const { query } = useContext(QueryContext);
const data = usePlasmicQueryData('myquery', query);
Advanced Topics
Background: approaches to data fetching
The easiest way to get data-fetching components working is to make them perform their own fetching. This is easy to do client-side using useEffect() or your choice of data fetching library such as react-query or react-swr. However, for statically generated pages or server-rendered pages, you may want to ensure these components fetch data statically at pre-render time.

There are two approaches to this.

For any Plasmic designs that need data, the developer ensures that (in the code) the needed data is fetched statically at the page level (using the usual mechanisms such as getStaticProps for Next.js), and then rely on React Context to provide the data to any dependent components. This does require you to (redundantly) specify in the page load phase the same set of data dependencies—an issue that is not specific to Plasmic.

(Recommended) Continue having components fetch their own data. To make this easy, Plasmic provides a simple data-fetching libraries, usePlasmicQueryData() and extractPlasmicQueryData(), that can perform isomorphic data fetching from within any component (using swr under the hood). The data extraction is based on react-ssr-prepass, and provides Suspense-style data fetching from any component, not just from getStaticProps or getServerSideProps.

