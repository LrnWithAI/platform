import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAFA",
  },
  headerBar: {
    backgroundColor: "#8b5cf6",
    padding: 14,
    borderRadius: 6,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  metaBox: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  metaText: {
    fontSize: 10,
    marginBottom: 3,
    color: "#374151",
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#1F2937",
    borderBottom: "1px solid #ddd",
    paddingBottom: 4,
  },
  contentText: {
    fontSize: 12,
    color: "#111827",
    lineHeight: 1.4,
  },
  image: {
    marginBottom: 12,
    height: 200,
    objectFit: "contain",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  footer: {
    borderTop: "1px solid #ccc",
    paddingTop: 10,
    fontSize: 10,
    color: "gray",
    textAlign: "center",
    marginTop: 30,
  },
  metaRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
    borderLeft: "3px solid #8b5cf6", // fialová línia
    paddingLeft: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    width: "35%",
  },
  metaValue: {
    fontSize: 10,
    color: "#374151",
    width: "65%",
    textAlign: "right",
    wordBreak: "break-word",
  },
});

interface Note {
  title: string;
  created_at: string;
  updated_at?: string;
  content: string;
  files?: { id: string; url: string; type: string }[];
}

interface User {
  first_name?: string;
  last_name?: string;
}

export const NotePDFDocument = ({ note, user }: { note: Note; user: User }) => {
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Farebná hlavička */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{note.title}</Text>
        </View>

        {/* Meta info */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created at:</Text>
            <Text style={styles.metaValue}>
              {new Date(note.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last updated at:</Text>
            <Text style={styles.metaValue}>
              {new Date(note.updated_at || note.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Exported at:</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Exported by:</Text>
            <Text style={styles.metaValue}>{fullName || "Neznámy"}</Text>
          </View>
        </View>

        {/* Obsah */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note content</Text>
          <Text style={styles.contentText}>{note.content}</Text>
        </View>

        {/* Prílohy */}
        {(note.files?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Files</Text>
            {(note.files ?? [])
              .filter((f) => f.type.startsWith("image/"))
              .map((file) => (
                <Image
                  key={file.id}
                  style={styles.image}
                  src={file.url}
                  // eslint-disable-next-line jsx-a11y/alt-text
                />
              ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            © {new Date().getFullYear()} LrnWithAI – Gererated Automatically
          </Text>
        </View>
      </Page>
    </Document>
  );
};
