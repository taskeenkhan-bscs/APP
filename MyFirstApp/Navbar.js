import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { safeRole } from "./accessibility";

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const DESKTOP_BREAKPOINT = 768;
const MENU_ITEM_HEIGHT = 48;
const MENU_VERTICAL_PADDING = 16;
const MOBILE_MENU_HEIGHT =
  NAV_ITEMS.length * MENU_ITEM_HEIGHT + MENU_VERTICAL_PADDING * 2 + 48;
const ANIMATION_DURATION = 220;

function NavigationLink({
  item,
  active,
  mobile,
  menuOpen,
  colors,
  onSelect,
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [underlineProgress] = useState(
    () => new Animated.Value(active ? 1 : 0),
  );

  useEffect(() => {
    const animation = Animated.timing(underlineProgress, {
      toValue: active || hovered ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [active, hovered, underlineProgress]);

  
return (
  <View
    style={[styles.linkItem, mobile && styles.mobileLinkItem]}
  >
    <Pressable
      accessibilityRole={safeRole("link")}
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      aria-current={active ? "location" : undefined}
      tabIndex={mobile && !menuOpen ? -1 : undefined}
      onPress={() => onSelect(item.id)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.linkButton,
        mobile && styles.mobileLinkButton,
        {
          borderColor: focused
            ? colors.accent
            : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.linkText,
          {
            color: active
              ? colors.text
              : colors.muted,
          },
        ]}
      >
        {item.label}
      </Text>

      <Animated.View
        style={[
          styles.underline,
          {
            backgroundColor: colors.accent,
            opacity: underlineProgress,
            transform: [
              { scaleX: underlineProgress },
            ],
          },
        ]}
      />
    </Pressable>
  </View>
);
}

export default function Navbar({
  activeSection,
  brandName,
  blurTarget,
  colors,
  darkMode,
  onHeaderLayout,
  onSelectSection,
  onToggleTheme,
  scrolled,
}) {
  const { width } = useWindowDimensions();
  const compact = width < DESKTOP_BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [focusedControl, setFocusedControl] = useState("");
  const [menuProgress] = useState(() => new Animated.Value(0));
  const displayBrandName = brandName.endsWith(".dev")
    ? brandName
    : `${brandName}.dev`;

  useEffect(() => {
    const animation = Animated.timing(menuProgress, {
      toValue: menuOpen ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && !menuOpen) setMenuMounted(false);
    });
    return () => animation.stop();
  }, [menuOpen, menuProgress]);

  const selectSection = (sectionId) => {
    setMenuOpen(false);
    onSelectSection(sectionId);
  };

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    setMenuMounted(true);
    setMenuOpen(true);
  };

  const themeToggle = (
    <Pressable
      accessibilityRole={safeRole("button")}
      accessibilityLabel={`Switch to ${darkMode ? "light" : "dark"} mode`}
      accessibilityState={{ checked: darkMode }}
      aria-pressed={darkMode}
      onPress={onToggleTheme}
      onFocus={() => setFocusedControl("theme")}
      onBlur={() => setFocusedControl("")}
      style={[
        styles.iconButton,
        { borderColor: focusedControl === "theme" ? colors.accent : "transparent" },
      ]}
    >
      <Text style={[styles.themeIcon, { color: colors.text }]}>
        {darkMode ? "☀" : "☾"}
      </Text>
    </Pressable>
  );

  const hireButton = (
    <Pressable
      accessibilityRole={safeRole("link")}
      accessibilityLabel="Hire me. Go to contact section"
      tabIndex={compact && !menuOpen ? -1 : undefined}
      onPress={() => selectSection("contact")}
      onFocus={() => setFocusedControl("hire")}
      onBlur={() => setFocusedControl("")}
      style={[
        styles.hireButton,
        {
          backgroundColor: colors.accent,
          borderColor: focusedControl === "hire" ? colors.text : colors.accent,
        },
      ]}
    >
      <Text style={[styles.hireButtonText, { color: colors.buttonText }]}>
        Hire Me
      </Text>
    </Pressable>
  );

  const navigationLinks = (
    <View style={mobileListStyles(compact)}>
      {NAV_ITEMS.map((item) => (
        <NavigationLink
          key={item.id}
          item={item}
          active={activeSection === item.id}
          mobile={compact}
          menuOpen={menuOpen}
          colors={colors}
          onSelect={selectSection}
        />
      ))}
    </View>
  );

  const animatedMenuHeight = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MOBILE_MENU_HEIGHT],
  });

  return (
    <View
      aria-label="Primary navigation"
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
          shadowColor: colors.shadow,
        },
        scrolled && styles.scrolledHeader,
      ]}
    >
      <BlurView
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={42}
        tint={darkMode ? "dark" : "light"}
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.header },
        ]}
      />
      <View style={styles.headerInner} onLayout={onHeaderLayout}>
        <Pressable
          accessibilityRole={safeRole("link")}
          accessibilityLabel={`${displayBrandName}, home`}
          onPress={() => selectSection("home")}
          onFocus={() => setFocusedControl("brand")}
          onBlur={() => setFocusedControl("")}
          style={[
            styles.brand,
            {
              borderColor:
                focusedControl === "brand" ? colors.accent : "transparent",
            },
          ]}
        >
          <Image
            source={require("./assets/images/taskeen-profile-dark.jpg")}
            accessibilityLabel="Taskeen Ullah.dev profile picture"
            resizeMode="cover"
            style={styles.brandAvatar}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.brandText, { color: colors.text }]}
          >
            {displayBrandName}
          </Text>
          <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
        </Pressable>

        {!compact && (
          <View style={styles.desktopControls}>
            {navigationLinks}
            {themeToggle}
            {hireButton}
          </View>
        )}

        {compact && (
          <View style={styles.mobileControls}>
            {themeToggle}
            <Pressable
              accessibilityRole={safeRole("button")}
              accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
              accessibilityState={{ expanded: menuOpen }}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
              onPress={toggleMenu}
              onFocus={() => setFocusedControl("menu")}
              onBlur={() => setFocusedControl("")}
              style={[
                styles.menuButton,
                {
                  borderColor:
                    focusedControl === "menu" ? colors.accent : "transparent",
                },
              ]}
            >
              <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
              <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
              <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
            </Pressable>
          </View>
        )}
      </View>

      {compact && menuMounted && (
        <Animated.View
          nativeID="mobile-navigation-menu"
          aria-hidden={!menuOpen}
          accessibilityElementsHidden={!menuOpen}
          importantForAccessibility={menuOpen ? "auto" : "no-hide-descendants"}
          pointerEvents={menuOpen ? "auto" : "none"}
          style={[
            styles.mobileMenu,
            {
              height: animatedMenuHeight,
              opacity: menuProgress,
              borderTopColor: colors.border,
              backgroundColor: colors.header,
              transform: [
                {
                  translateY: menuProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {navigationLinks}
          {hireButton}
        </Animated.View>
      )}
    </View>
  );
}

function mobileListStyles(compact) {
  return compact ? styles.mobileList : styles.desktopList;
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 12,
    elevation: 0,
  },
  scrolledHeader: {
    shadowOpacity: 0.1,
    elevation: 4,
  },
  headerInner: {
    minHeight: 76,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    minHeight: 44,
    flexShrink: 1,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  brandText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
  },
  desktopControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  desktopList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  linkItem: {
    justifyContent: "center",
  },
  linkButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
  underline: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    height: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  themeIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
  hireButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  hireButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  mobileControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  menuLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  mobileMenu: {
    width: "100%",
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    alignItems: "stretch",
  },
  mobileList: {
    paddingTop: MENU_VERTICAL_PADDING,
    paddingBottom: 8,
  },
  mobileLinkItem: {
    height: MENU_ITEM_HEIGHT,
  },
  mobileLinkButton: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
