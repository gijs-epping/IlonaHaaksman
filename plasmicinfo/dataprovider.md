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
Was this page helpful?

Yes

No