import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

export default function FoodDetails() {
  const { id } = useLocalSearchParams();
  const [food, setFood] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFood = async () => {
      const docRef = doc(db, "foods", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFood({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchFood();
  }, [id]);

  const deleteFood = async () => {
    await deleteDoc(doc(db, "foods", id));
    router.replace("/");  // Après suppression, redirige vers la page d'accueil
  };

  if (!food) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{food.name}</Text>
      <Text style={styles.details}>Poids: {food.weight} kg</Text>
      <Text style={styles.details}>Quantité: {food.quantity}</Text>
      <Text style={styles.description}>Description: {food.description}</Text>
      <Button title="Supprimer" onPress={deleteFood} color="#D32F2F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  details: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: "italic",
    color: "#777",
  },
});
