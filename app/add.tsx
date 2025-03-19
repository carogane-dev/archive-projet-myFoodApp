// AddFood.tsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker'; // Import du DateTimePicker
import { addFoodToDatabase } from "./addFoodToDatabase"; // Import de la fonction réutilisable

export default function AddFood() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date()); // Date initiale
  const [showDatePicker, setShowDatePicker] = useState(false); // Gérer l'affichage du DatePicker
  const router = useRouter();

  const addFoodHandler = async () => {
    // Vérification que tous les champs sont remplis
    if (name.trim() && weight.trim() && quantity.trim()) {
      try {
        // Appel de la fonction addFoodToDatabase pour ajouter l'aliment
        await addFoodToDatabase(name, weight, quantity, description, expiryDate);

        // Réinitialisation des champs après l'ajout
        setName("");
        setWeight("");
        setQuantity("");
        setDescription("");
        setExpiryDate(new Date()); // Réinitialiser la date
        setShowDatePicker(false); // Fermer le sélecteur de date

        // Redirection vers la page d'accueil
        router.push("/");

      } catch (error:any) {
        console.error("Erreur lors de l'ajout de l'aliment : ", error);
        alert(error.message); // Afficher l'erreur si elle se produit
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
