import { Center, Dialog, Image, Portal, SystemStyleObject } from "@chakra-ui/react";
import { ids } from "@/e2e/ids";

export function ImageWithDialog(props: {
  src: string;
  alt?: string;
  isDimmed?: boolean;
  maxH?: SystemStyleObject["maxH"];
}) {
  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild>
        <Center>
          <Image
            src={props.src}
            alt={
              props.alt
                ? props.alt
                : props.src.match(/(?<name>[\w-]+).(avif|png|jpe?g)/)?.groups?.name
            }
            maxW="min(550px, 100%)"
            maxH={props.maxH}
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
                  maxH="94vh"
                  maxW="94vw"
                  src={props.src}
                  alt={props.alt}
                  pos="initial"
                  objectFit="contain"
                  cursor="zoom-out"
                  rounded="lg"
                />
              </Dialog.CloseTrigger>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
