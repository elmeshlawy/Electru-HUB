export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%23f1f5f9%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Cpath%20d%3D%22M160%20160h80v80h-80z%22%20fill%3D%22%230284c7%22%20opacity%3D%220.2%22%2F%3E%3Ctext%20fill%3D%22%230f172a%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2260%25%22%20text-anchor%3D%22middle%22%3EElectroHub%20Device%3C%2Ftext%3E%3C%2Fsvg%3E';

export function handleImageFallback(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  if (imgElement && imgElement.src !== FALLBACK_PRODUCT_IMAGE) {
    imgElement.src = FALLBACK_PRODUCT_IMAGE;
  }
}
