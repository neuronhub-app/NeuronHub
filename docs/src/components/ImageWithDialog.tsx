import { Center, Dialog, Image, Portal, SystemStyleObject } from "@chakra-ui/react";
import { ids } from "@/e2e/ids";

export function ImageWithDialog(props: {
  src: string;
  alt?: string;
  isDimmed?: boolean;
  maxH?: SystemStyleObject["maxH"];
  maxW?: SystemStyleObject["maxW"];
  size?: "xs" | "sm" | "md";
}) {
  const style: SystemStyleObject = {
    maxW: "min(550px, 100%)",
    my: "10",
    justifyContent: "center",
  };

  const size = props.size ?? "md";
  if (["xs", "sm"].includes(size)) {
    style.my = "gap.sm";
    style.justifyContent = "flex-start";
    style.w = "fit-content";
  }
  switch (size) {
    case "xs":
      style.maxW = "250px";
      break;
    case "sm":
      style.maxW = "350px";
      break;
  }

  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild w={style.w}>
        <Center>
          <Image
            src={props.src}
            alt={
              props.alt
                ? props.alt
                : props.src.match(/(?<name>[\w-]+).(avif|png|jpe?g)/)?.groups?.name
            }
            my={style.my}
            maxW={style.maxW}
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
          <Dialog.Content w="fit-content" bg="0">
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
