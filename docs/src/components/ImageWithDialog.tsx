import { Center, Dialog, Image, Portal } from "@chakra-ui/react";
import { ids } from "@/e2e/ids";

export function ImageWithDialog(props: { src: string; alt: string; isDimmed?: boolean }) {
  const style = {
    maxW: "94vw",
    maxH: "94vh",
  } as const;

  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild>
        <Center>
          <Image
            src={props.src}
            alt={props.alt}
            maxW="min(550px, 100%)"
            boxShadow="xl"
            cursor="zoom-in"
            filter={
              props.isDimmed ? { _dark: "brightness(0.95)", _light: "brightness(0.98)" } : ""
            }
            _hover={{
              filter: "brightness(1)",
            }}
            transition="filter"
            transitionDuration="fast"
          />
        </Center>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop
          {...ids.set(ids.imageZoom.backdrop)}
          bg={{ _dark: "blackAlpha.900/90", _light: "blackAlpha.900" }}
        />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Body display="flex" justifyContent="center" alignItems="center" p="0">
              <Dialog.CloseTrigger asChild>
                <Image
                  src={props.src}
                  alt={props.alt}
                  pos="initial"
                  objectFit="contain"
                  cursor="zoom-out"
                  rounded="lg"
                  {...style}
                />
              </Dialog.CloseTrigger>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
