import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useLocation } from "react-router-dom";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const location = useLocation();

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <Link className="flex justify-start items-center gap-2" href="/">
            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-blue-50 p-1 flex items-center justify-center border border-blue-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-blue-100 group">
              <img
                src="/microscope.gif"
                alt="Microscope"
                className="h-7 w-7 microscope-logo animate-microscope group-hover:scale-110 transition-transform duration-300 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              বিজ্ঞান
              <span className="text-emerald-600 dark:text-emerald-500">
                বন্ধু
              </span>
            </span>
          </Link>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:font-medium data-[active=true]:text-blue-600"
                )}
                color="foreground"
                data-active={location.pathname === item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal"
            color="default"
            href="/about"
            variant="flat"
          >
            আমাদের সম্পর্কে
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal"
            color="primary"
            href="/usage-guide"
            variant="flat"
          >
            নির্দেশিকা
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 0
                    ? "primary"
                    : location.pathname === item.href
                      ? "primary"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
