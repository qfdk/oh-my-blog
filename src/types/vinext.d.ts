/**
 * vinext provides shims for Next.js APIs.
 * These declarations map `next/*` imports to vinext's type definitions.
 */

declare module "next" {
  export { Metadata, Viewport } from "vinext/shims/metadata";
}

declare module "next/link" {
  import LinkComponent from "vinext/shims/link";
  export default LinkComponent;
}

declare module "next/navigation" {
  export {
    usePathname,
    useRouter,
    useSearchParams,
    useSelectedLayoutSegment,
    useSelectedLayoutSegments,
    useParams,
    notFound,
    redirect,
    permanentRedirect,
    RedirectType,
  } from "vinext/shims/navigation";
}

declare module "next/server" {
  export {
    NextRequest,
    NextResponse,
  } from "vinext/shims/server";
}
