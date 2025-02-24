import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker'; // Import du DateTimePicker

export default function AddFood() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date()); // Date initiale
  const [showDatePicker, setShowDatePicker] = useState(false); // Gérer l'affichage du DatePicker
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const addFoodHandler = async () => {
    // Vérification pour s'assurer que l'utilisateur est connecté et les champs essentiels sont remplis
    if (!user) {
      alert("Vous devez être connecté pour ajouter un aliment.");
      return;
    }

    if (name.trim() && weight.trim() && quantity.trim()) {
      const newFood = {
        name,
        weight,
        quantity,
        description, // La description peut être vide
        expiryDate: expiryDate.toISOString(), // Stocker la date au format ISO
        userId: user.uid, // Associer l'aliment à l'utilisateur connecté
      };

      try {
        // Ajout du document dans la collection "foods"
        console.log("UID de l'utilisateur connecté :", user.uid);
        await addDoc(collection(db, "foods"), newFood);
        console.log("passé :", user.uid);

        // Réinitialiser les champs après l'ajout de l'aliment
        setName("");
        setWeight("");
        setQuantity("");
        setDescription("");
        setExpiryDate(new Date()); // Réinitialiser la date
        setShowDatePicker(false); // Fermer le sélecteur de date

        router.push("/"); // Après l'ajout, redirige vers la page d'accueil
      } catch (error) {
        if (error instanceof Error) {
          console.error("Erreur lors de l'ajout de l'aliment : ", error.message);
          alert(`Erreur lors de l'ajout de l'aliment : ${error.message}`);
        } else {
          console.error("Erreur inconnue lors de l'ajout de l'aliment : ", error);
          alert("Erreur inconnue lors de l'ajout de l'aliment.");
        }
      }
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
    setShowDatePicker(false); // Fermer le sélecteur de date après sélection
  };

  const getButtonStyle = () => {
    const currentHour = new Date().getHours();
    // Choisir une couleur dynamique en fonction de l'heure de la journée (exemple simple : jour/nuit)
    if (currentHour >= 6 && currentHour < 18) {
      return styles.dayButton; // Couleur pour la journée (ex. bleu clair)
    } else {
      return styles.nightButton; // Couleur pour la nuit (ex. bleu foncé)
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nom de l'aliment"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Poids (en kg)"
        value={weight}
        onChangeText={setWeight}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Quantité"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Description (facultatif)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      {/* Bouton avec couleur dynamique */}
      <Button 
        title={`Date de péremption: ${expiryDate.toLocaleDateString()}`} 
        onPress={() => setShowDatePicker(true)} 
        color={getButtonStyle().backgroundColor} 
      />

      {/* Afficher le DateTimePicker sous forme de roue */}
      {showDatePicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date" // Mode "date" pour afficher jour/mois/année
          display="spinner" // Affichage sous forme de roue
          onChange={onDateChange}
          style={{ backgroundColor: 'transparent' }} // Garde le fond transparent
          textColor="black" // Change la couleur du texte (affecte la roue de sélection)
        />
      )}

      <Button title="Ajouter" onPress={addFoodHandler} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dayButton: {
    backgroundColor: "#2196F3", // Bleu clair pour la journée
  },
  nightButton: {
    backgroundColor: "#0D47A1", // Bleu foncé pour la nuit
  },
});
