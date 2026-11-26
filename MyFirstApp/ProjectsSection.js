import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PROJECTS } from "./projects";

export default function ProjectsSection({ colors, onLayout }) {
  const { width } = useWindowDimensions();
  const cardWidth =
    width >= 1100 ? "31.5%" : width >= 768 ? "48.5%" : "100%";
  const [webError, setWebError] = useState("");

  const openProject = async (project) => {
    setWebError("");

    try {
      const canOpen = await Linking.canOpenURL(project.url);
      if (!canOpen) {
        throw new Error(`No application can open ${project.url}`);
      }

      await Linking.openURL(project.url);
    } catch (error) {
      console.error(`Unable to open ${project.name}.`, error);
      const message = `Could not open the link for ${project.name}.`;

      if (Platform.OS === "web") {
        setWebError(message);
      } else {
        Alert.alert("Unable to open project", message);
      }
    }
  };

  return (
    <View
      nativeID="projects"
      onLayout={onLayout}
      style={[styles.section, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.heading, { color: colors.text }]}>
          My Projects
        </Text>

        <View style={styles.cards}>
          {PROJECTS.map((project, index) => (
            <View
              key={project.name}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.cardHeading}>
                <View
                  style={[
                    styles.numberBadge,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={styles.numberText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <Text style={[styles.projectName, { color: colors.text }]}>
                  {project.name}
                </Text>
              </View>

              <Text style={[styles.description, { color: colors.muted }]}>
                {project.description}
              </Text>

              {project.url ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Visit project: ${project.name}`}
                  onPress={() => openProject(project)}
                  style={[
                    styles.visitButton,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={styles.visitLabel}>Visit Project</Text>
                  <Ionicons
                    name="open-outline"
                    size={18}
                    color="#ffffff"
                  />
                </Pressable>
              ) : (
                <Text
                  style={[
                    styles.comingSoon,
                    { color: colors.muted, backgroundColor: colors.badge },
                  ]}
                >
                  Coming Soon
                </Text>
              )}
            </View>
          ))}
        </View>

        {!!webError && (
          <Text style={styles.errorMessage} accessibilityLiveRegion="polite">
            {webError}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    paddingVertical: 72,
  },
  container: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  heading: {
    marginBottom: 28,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  card: {
    minHeight: 218,
    padding: 20,
    borderWidth: 1,
    borderRadius: 18,
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  description: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 18,
  },
  visitButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  visitLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  comingSoon: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "700",
  },
  errorMessage: {
    marginTop: 18,
    color: "#b42318",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
