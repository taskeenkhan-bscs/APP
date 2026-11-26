import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurTargetView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar, { NAV_ITEMS } from "./Navbar";
import AboutSection, { ABOUT_DATA } from "./AboutSection";
import ContactSection from "./ContactSection";
import ProjectsSection from "./ProjectsSection";
import ChatAssistant from "./ChatAssistant";
import { safeRole } from "./accessibility";

const ACCENT_COLOR = "#1b48a9";
const THEME_STORAGE_KEY = "portfolio-theme";
const ACTIVE_SECTION_OFFSET = 80;
const CONTENT_MAX_WIDTH = 1080;
const SECTION_MIN_HEIGHT = 420;

const THEMES = {
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    header: "rgba(255,255,255,0.78)",
    text: "#111827",
    muted: "#526071",
    border: "#e5e7eb",
    accent: ACCENT_COLOR,
    shadow: "#0f172a",
    buttonText: "#ffffff",
    card: "#ffffff",
    badge: "#f8fafc",
    skillHover: "#eff6ff",
  },
  dark: {
    background: "#0b1220",
    surface: "#111b2d",
    header: "rgba(11,18,32,0.78)",
    text: "#f8fafc",
    muted: "#b2bfd1",
    border: "#263449",
    accent: "#60a5fa",
    shadow: "#000000",
    buttonText: "#ffffff",
    card: "#111b2d",
    badge: "#17243a",
    skillHover: "#18263c",
  },
};

const SECTION_CONTENT = {
  home: {
    eyebrow: "PORTFOLIO",
    title: "Thoughtful digital experiences, built with purpose.",
    description: `I’m ${ABOUT_DATA.name} — a developer and designer building thoughtful web, mobile, and desktop applications.`,
  },
  skills: {
    eyebrow: "WHAT I DO",
    title: "Skills & strengths",
    description:
      "I combine frontend craftsmanship, backend logic, and product thinking to bring ideas from concept to deployment.",
  },
};

export default function App() {
  const scrollRef = useRef(null);
  const blurTargetRef = useRef(null);
  const sectionOffsets = useRef({});
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const { width } = useWindowDimensions();
  const colors = darkMode ? THEMES.dark : THEMES.light;

  // Restore the web preference from localStorage and use native storage on devices.
  useEffect(() => {
    let mounted = true;

    const restoreTheme = async () => {
      try {
        const savedTheme =
          Platform.OS === "web" && typeof window !== "undefined"
            ? window.localStorage.getItem(THEME_STORAGE_KEY)
            : await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (mounted && savedTheme) setDarkMode(savedTheme === "dark");
      } catch (error) {
        console.error("Unable to restore the saved theme preference.", error);
      } finally {
        if (mounted) setThemeLoaded(true);
      }
    };

    restoreTheme();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    const saveTheme = async () => {
      try {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.localStorage.setItem(
            THEME_STORAGE_KEY,
            darkMode ? "dark" : "light",
          );
        } else {
          await AsyncStorage.setItem(
            THEME_STORAGE_KEY,
            darkMode ? "dark" : "light",
          );
        }
      } catch (error) {
        console.error("Unable to save the theme preference.", error);
      }
    };
    saveTheme();
  }, [darkMode, themeLoaded]);

  const scrollToSection = (sectionId) => {
    const sectionTop = sectionOffsets.current[sectionId];
    if (typeof sectionTop !== "number") return;

    scrollRef.current?.scrollTo({
      y: Math.max(sectionTop - headerHeight, 0),
      animated: true,
    });
  };

  const updateActiveSection = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    setScrolled(scrollOffset > 8);
    const marker =
      scrollOffset + headerHeight + ACTIVE_SECTION_OFFSET;
    let nextActiveSection = NAV_ITEMS[0].id;

    NAV_ITEMS.forEach(({ id }) => {
      const sectionTop = sectionOffsets.current[id];
      if (typeof sectionTop === "number" && sectionTop <= marker) {
        nextActiveSection = id;
      }
    });

    setActiveSection(nextActiveSection);
  };

  return (
    <View style={[styles.app, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? THEMES.dark.header : THEMES.light.header}
      />
      <Navbar
        activeSection={activeSection}
        brandName={ABOUT_DATA.name}
        blurTarget={blurTargetRef}
        colors={colors}
        darkMode={darkMode}
        onHeaderLayout={(event) =>
          setHeaderHeight(event.nativeEvent.layout.height)
        }
        onSelectSection={scrollToSection}
        onToggleTheme={() => setDarkMode((enabled) => !enabled)}
        scrolled={scrolled}
      />
      <BlurTargetView ref={blurTargetRef} style={styles.app}>
        <ScrollView
          ref={scrollRef}
          onScroll={updateActiveSection}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight },
          ]}
          style={{ backgroundColor: colors.background }}
        >
          {NAV_ITEMS.map((item, index) => {
            const onLayout = (event) => {
              sectionOffsets.current[item.id] = event.nativeEvent.layout.y;
            };

            if (item.id === "contact") {
              return (
                <ContactSection
                  key={item.id}
                  colors={colors}
                  onLayout={onLayout}
                />
              );
            }

            if (item.id === "projects") {
              return (
                <ProjectsSection
                  key={item.id}
                  colors={colors}
                  onLayout={onLayout}
                />
              );
            }

            if (item.id === "about") {
              return (
                <AboutSection
                  key={item.id}
                  colors={colors}
                  compact={width < 768}
                  isVisible={activeSection === item.id}
                  onContact={() => scrollToSection("contact")}
                  onLayout={onLayout}
                />
              );
            }

            return (
              <PortfolioSection
                key={item.id}
                item={item}
                content={SECTION_CONTENT[item.id]}
                colors={colors}
                compact={width < 768}
                alternate={index % 2 === 1}
                onLayout={onLayout}
                onAction={() =>
                  scrollToSection(item.id === "home" ? "projects" : "contact")
                }
              />
            );
          })}
        </ScrollView>
      </BlurTargetView>
      <ChatAssistant colors={colors} />
    </View>
  );
}

function PortfolioSection({
  item,
  content,
  colors,
  compact,
  alternate,
  onLayout,
  onAction,
}) {
  const [actionFocused, setActionFocused] = useState(false);

  return (
    <View
      nativeID={item.id}
      aria-label={`${content.eyebrow} section`}
      onLayout={onLayout}
      style={[
        styles.section,
        { backgroundColor: alternate ? colors.surface : colors.background },
      ]}
    >
      <View style={[styles.sectionContent, compact && styles.compactContent]}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          {content.eyebrow}
        </Text>
        <Text
          accessibilityRole={safeRole("header")}
          aria-level={item.id === "home" ? 1 : 2}
          style={[
            styles.title,
            { color: colors.text },
            compact && styles.compactTitle,
          ]}
        >
          {content.title}
        </Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          {content.description}
        </Text>
        {(item.id === "home" || item.id === "contact") && (
          <Pressable
            accessibilityRole={safeRole("link")}
            accessibilityLabel={
              item.id === "home" ? "Explore my work" : "Contact me"
            }
            onPress={onAction}
            onFocus={() => setActionFocused(true)}
            onBlur={() => setActionFocused(false)}
            style={[
              styles.textAction,
              {
                borderColor: actionFocused ? colors.accent : "transparent",
              },
            ]}
          >
            <Text style={{ color: colors.accent }}>
              {item.id === "home" ? "Explore my work  →" : "Let’s talk  →"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    minHeight: SECTION_MIN_HEIGHT,
    justifyContent: "center",
    paddingVertical: 72,
    paddingHorizontal: 24,
  },
  sectionContent: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 32,
  },
  compactContent: {
    paddingHorizontal: 0,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 18,
  },
  title: {
    maxWidth: 820,
    fontSize: 48,
    lineHeight: 58,
    fontWeight: "800",
    letterSpacing: -1,
  },
  compactTitle: {
    fontSize: 36,
    lineHeight: 44,
  },
  description: {
    maxWidth: 660,
    fontSize: 17,
    lineHeight: 28,
    marginTop: 20,
  },
  textAction: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderRadius: 6,
  },
});
