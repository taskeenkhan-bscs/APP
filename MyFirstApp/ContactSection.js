import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

export const LINKEDIN_URL = "https://www.linkedin.com/in/taskoo-wzr";

const PROFILE_NAME = "Taskeen Ullah.dev";
const PHONE_NUMBER = "03324759879";
const WHATSAPP_NUMBER = "03088788989";
const EMAIL_ADDRESS = "taskeenullah373@gmail.com";
const GITHUB_USERNAME = "taskeenkhan-bscs";
const GITHUB_URL = "https://github.com/taskeenkhan-bscs";
const WHATSAPP_URL =
  "https://wa.me/923088788989?text=Hello%20Taskeen,%20I%20want%20to%20contact%20you";
const EMAIL_URL =
  "mailto:taskeenullah373@gmail.com?subject=Contact%20from%20your%20app";

const CONTACT_ACTIONS = [
  {
    label: "Call Me",
    url: "tel:+923324759879",
    Icon: Ionicons,
    iconName: "call-outline",
  },
  {
    label: "SMS Me",
    url: "sms:+923324759879",
    Icon: Ionicons,
    iconName: "chatbubble-ellipses-outline",
  },
  {
    label: "WhatsApp",
    url: WHATSAPP_URL,
    Icon: FontAwesome,
    iconName: "whatsapp",
    color: "#25D366",
  },
  {
    label: "Email Me",
    url: EMAIL_URL,
    Icon: Ionicons,
    iconName: "mail-outline",
  },
  {
    label: "GitHub",
    url: GITHUB_URL,
    Icon: FontAwesome,
    iconName: "github",
    color: "#333333",
  },
  {
    label: "LinkedIn",
    url: LINKEDIN_URL,
    Icon: FontAwesome,
    iconName: "linkedin",
    color: "#0A66C2",
  },
];

export default function ContactSection({ colors, onLayout }) {
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const [webError, setWebError] = useState("");

  const handleContactAction = async (action) => {
    setWebError("");

    try {
      const canOpen = await Linking.canOpenURL(action.url);
      if (!canOpen) {
        throw new Error(`No application can open ${action.url}`);
      }

      await Linking.openURL(action.url);
    } catch (error) {
      console.error(`Unable to open the ${action.label} action.`, error);
      const message = `${action.label} is not supported on this device.`;

      if (Platform.OS === "web") {
        setWebError(message);
      } else {
        Alert.alert("Action not supported", message);
      }
    }
  };

  return (
    <View
      nativeID="contact"
      onLayout={onLayout}
      style={[styles.section, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Image
          source={require("./assets/images/taskeen-profile-dark.jpg")}
          accessibilityLabel="Taskeen Ullah.dev profile picture"
          resizeMode="cover"
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: colors.text }]}>
          {PROFILE_NAME}
        </Text>
        <Text style={[styles.intro, { color: colors.muted }]}>
          Get in touch using your preferred method.
        </Text>

        <View style={styles.contactDetails}>
          <ContactDetail label="Phone" value={PHONE_NUMBER} colors={colors} />
          <ContactDetail
            label="WhatsApp"
            value={WHATSAPP_NUMBER}
            colors={colors}
          />
          <ContactDetail
            label="Email"
            value={EMAIL_ADDRESS}
            colors={colors}
          />
          <ContactDetail
            label="GitHub"
            value={GITHUB_USERNAME}
            colors={colors}
          />
        </View>

        <View
          style={[
            styles.actions,
            compact ? styles.actionsCompact : styles.actionsWide,
          ]}
        >
          {CONTACT_ACTIONS.map((action) => {
            const Icon = action.Icon;

            return (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => handleContactAction(action)}
                style={[
                  styles.actionButton,
                  compact ? styles.actionButtonCompact : styles.actionButtonWide,
                  {
                    backgroundColor: action.color || colors.accent,
                    borderColor: action.color || colors.accent,
                  },
                ]}
              >
                <Icon name={action.iconName} size={20} color="#ffffff" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            );
          })}
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

function ContactDetail({ label, value, colors }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <Text
        selectable
        style={[styles.detailValue, { color: colors.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    padding: 24,
    borderWidth: 1,
    borderRadius: 24,
  },
  profileImage: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginBottom: 16,
    borderRadius: 48,
  },
  name: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  intro: {
    marginTop: 6,
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  contactDetails: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    gap: 3,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 23,
  },
  actions: {
    gap: 12,
  },
  actionsCompact: {
    flexDirection: "column",
  },
  actionsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  actionButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  actionButtonCompact: {
    width: "100%",
  },
  actionButtonWide: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  actionLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  errorMessage: {
    marginTop: 16,
    color: "#d62013",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});