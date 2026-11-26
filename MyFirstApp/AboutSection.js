import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { safeRole } from "./accessibility";

// Edit this object to update the About section's copy, stats, education, and skills.
export const ABOUT_DATA = {
  name: "Taskeen Ullah",
  role: "MERN Stack Developer & Web Designer",
  focus: "Building web, mobile, and desktop applications",
  resumeUrl: "",
  bio:
    "I’m a recent BSCS graduate who designs and builds complete web, mobile, and desktop applications. I work across the MERN stack and enjoy shaping useful, easy-to-use experiences—from the first design sketch to the finished product.",
  stats: [
    { value: "X+", label: "Projects" },
    { value: "X+", label: "Technologies" },
    { value: "2026", label: "Fresh Graduate" },
  ],
  education: {
    degree: "BS Computer Science (BSCS)",
    period: "2022 to 2026",
    status: "Graduate",
    cgpa: "3.96/4.0",
  },  
   skills: [
    {
      category: "Frontend",
      icon: "</>",
      items: ["HTML", "CSS", "Tailwind CSS", "Bootstrap", "JavaScript", "React"],
    },
    {
      category: "Backend",
      icon: "{ }",
      items: ["Node.js", "Express.js", "Firebase"],
    },
    {
      category: "Databases",
      icon: "◈",
      items: ["MongoDB", "Firestore", "MySQL", "SQL Server"],
    },
    {
      category: "Mobile, Website & Desktop Development",
      icon: "▣",
      items: [
        "Mobile App Development (React Native)",
        "Website Development (React, HTML, CSS, JavaScript)",
        "Desktop App Development (Electron + React)",
        "Database Integration (SQL Server, MongoDB, Firebase)",
      ],
    },
    {
      category: "Tools & Deployment",
      icon: "⌘",
      items: ["Git", "GitHub", "Vercel", "Netlify" ,"VS Code", "Visual Studio" ,"Postman"],
    },
    {
      category: "MS Office",
      icon: "▤",  
      items: ["MS Word", "MS Excel", "MS PowerPoint", "MS Access", "MS Outlook", "CIT & DIT"],
    },
    {
      category: "Programming Languages",
      icon: "#",
      items: ["C++", "C#" , "JavaScript"," TypeScript"]
    },
  ],
};

const REVEAL_DURATION = 420;
const PROFILE_IMAGE_SIZE = 236;

export default function AboutSection({
  colors,
  compact,
  isVisible,
  onContact,
  onLayout,
}) {
  const [revealProgress] = useState(() => new Animated.Value(0));
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    if (!isVisible || hasRevealed) return undefined;

    const animation = Animated.timing(revealProgress, {
      toValue: 1,
      duration: REVEAL_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) setHasRevealed(true);
    });
    return () => animation.stop();
  }, [hasRevealed, isVisible, revealProgress]);

  const handleResumePress = () => {
    if (ABOUT_DATA.resumeUrl) {
      Linking.openURL(ABOUT_DATA.resumeUrl).catch((error) => {
        console.error("Unable to open the resume.", error);
        showResumeMessage("Unable to open resume", "The resume could not be opened.");
      });
      return;
    }

    showResumeMessage(
      "Resume not added yet",
      "Add your resume PDF URL to ABOUT_DATA.resumeUrl to enable this button.",
    );
  };

  const showResumeMessage = (title, message) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  return (
    <View
      nativeID="about"
      aria-label="About Me"
      onLayout={onLayout}
      style={[
        styles.section,
        { backgroundColor: colors.background },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: revealProgress,
            transform: [
              {
                translateY: revealProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.sectionHeading}>
          <Text accessibilityRole={safeRole("header")} aria-level={2} style={[styles.heading, { color: colors.text }]}>
            About Me
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            A little about who I am and what I love to build
          </Text>
        </View>

        <View style={[styles.introRow, compact && styles.compactIntroRow]}>
          <Image
            accessibilityRole={safeRole("image")}
            accessibilityLabel={`${ABOUT_DATA.name} profile picture`}
            source={require("./assets/images/taskeen-profile-dark.jpg")}
            resizeMode="cover"
            style={[
              styles.profileImage,
              compact && styles.compactProfile,
              {
                borderColor: colors.border,
                width: compact ? PROFILE_IMAGE_SIZE - 24 : PROFILE_IMAGE_SIZE,
                height: compact ? PROFILE_IMAGE_SIZE - 24 : PROFILE_IMAGE_SIZE,
              },
            ]}
          />

          <View style={styles.bioColumn}>
            <Text style={[styles.name, { color: colors.text }]}>
              {ABOUT_DATA.name}
            </Text>
            <Text style={[styles.role, { color: colors.accent }]}>
              {ABOUT_DATA.role}
            </Text>
            <Text style={[styles.focus, { color: colors.muted }]}>
              {ABOUT_DATA.focus}
            </Text>
            <Text style={[styles.bio, { color: colors.muted }]}>
              {ABOUT_DATA.bio}
            </Text>

            <View style={styles.statsRow}>
              {ABOUT_DATA.stats.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.educationBlock}>
          <Text style={[styles.blockHeading, { color: colors.text }]}>
            Education
          </Text>
          <View
            style={[
              styles.educationCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.educationIcon,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.educationIconText}>BS</Text>
            </View>
            <View style={styles.educationDetails}>
              <Text style={[styles.educationDegree, { color: colors.text }]}>
                {ABOUT_DATA.education.degree}
              </Text>
              <Text style={[styles.educationMeta, { color: colors.muted }]}>
                {ABOUT_DATA.education.period} · {ABOUT_DATA.education.status}
              </Text>
              {!!ABOUT_DATA.education.cgpa && (
                <Text style={[styles.educationMeta, { color: colors.muted }]}>
                  CGPA: {ABOUT_DATA.education.cgpa}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.skillsBlock}>
          <Text style={[styles.blockHeading, { color: colors.text }]}>
            Skills & technologies
          </Text>
          <View style={styles.skillGrid}>
            {ABOUT_DATA.skills.map((skill) => (
              <SkillCard key={skill.category} skill={skill} colors={colors} />
            ))}
          </View>
        </View>

        <View style={[styles.actions, compact && styles.compactActions]}>
          <ActionButton
            label="Download Resume"
            colors={colors}
            primary
            onPress={handleResumePress}
          />
          <ActionButton
            label="Contact Me"
            colors={colors}
            onPress={onContact}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function SkillCard({ skill, colors }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityLabel={`${skill.category}: ${skill.items.join(", ")}`}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.skillCard,
        {
          backgroundColor: hovered ? colors.skillHover : colors.card,
          borderColor:
            hovered || focused ? colors.accent : colors.border,
        },
      ]}
    >
      <View style={styles.skillHeading}>
        <Text style={[styles.skillIcon, { color: colors.accent }]}>
          {skill.icon}
        </Text>
        <Text style={[styles.skillCategory, { color: colors.text }]}>
          {skill.category}
        </Text>
      </View>
      <View style={styles.skillBadges}>
        {skill.items.map((item) => (
          <View
            key={item}
            style={[
              styles.skillBadge,
              { backgroundColor: colors.badge, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.skillBadgeText, { color: colors.muted }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function ActionButton({ label, colors, primary = false, onPress }) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole={safeRole("button")}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.actionButton,
        {
          backgroundColor: primary ? colors.accent : colors.card,
          borderColor: focused ? colors.text : colors.accent,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          { color: primary ? colors.buttonText : colors.accent },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    paddingVertical: 76,
  },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
  },
  sectionHeading: {
    marginBottom: 36,
  },
  heading: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
  },
  compactIntroRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 28,
  },
  profileImage: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  compactProfile: {
    alignSelf: "center",
  },
  bioColumn: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
  },
  role: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  focus: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 25,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },
  statCard: {
    minWidth: 112,
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  educationBlock: {
    marginTop: 42,
  },
  blockHeading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    marginBottom: 14,
  },
  educationCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
  },
  educationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  educationIconText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  educationDetails: {
    flex: 1,
    gap: 4,
  },
  educationDegree: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  educationMeta: {
    fontSize: 14,
    lineHeight: 21,
  },
  skillsBlock: {
    marginTop: 42,
  },
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  skillCard: {
    width: "31%",
    minWidth: 220,
    flexGrow: 1,
    minHeight: 142,
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
  },
  skillHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skillIcon: {
    minWidth: 26,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  skillCategory: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  skillBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
  },
  skillBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 36,
  },
  compactActions: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  actionButton: {
    minHeight: 48,
    minWidth: 156,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
