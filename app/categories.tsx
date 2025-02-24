import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList
} from "react-native";
import { useRouter } from "expo-router";

// Type pour les catégories
interface Category {
  id: string;
  title: string;
  image: any;
  filterParam: string; // Valeur à transmettre pour filtrer les aliments
  bgColor: string; // Couleur de fond de l'encadré
}

export default function Categories() {
  const router = useRouter();

  // Liste des catégories avec des couleurs de fond différentes
  const categories: Category[] = [
    {
      id: "1",
      title: "Poissons & Viandes",
      image: require("../assets/images/viande.png"),
      filterParam: "viandes",
      bgColor: "#FFC107" // Jaune
    },
    {
      id: "2",
      title: "Fruits",
      image: require("../assets/images/fruits.png"),
      filterParam: "fruits",
      bgColor: "#8BC34A" // Vert clair
    },
    {
      id: "3",
      title: "Légumes",
      image: require("../assets/images/legumes.png"),
      filterParam: "légumes",
      bgColor: "#03A9F4" // Bleu
    },
    {
      id: "4",
      title: "Glucides",
      image: require("../assets/images/feculent.png"),
      filterParam: "glucides",
      bgColor: "#E91E63" // Rose
    }
  ];

  const renderCategory = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: item.bgColor }]}
        onPress={() =>
          router.push({
            pathname: "/",
            params: { category: item.filterParam }
          })
        }
      >
        <Image source={item.image} style={styles.cardImage} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Catégories d'aliments</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: 40,
    paddingHorizontal: 16
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
    color: "#333"
  },
  gridContainer: {
    paddingBottom: 20
  },
  columnWrapper: {
    justifyContent: "space-between"
  },
  card: {
    width: "45%",         // Réduit la largeur pour éviter l'encombrement
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  cardImage: {
    position: "absolute",
    width: "110%",        // L'image dépasse légèrement la carte pour un effet 3D
    height: "110%",
    top: "-5%",
    left: "-5%",
    resizeMode: "cover",
    transform: [{ scale: 1.02 }, { rotateX: "3deg" }]
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 10
  },
  categoryTitle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  }
});
