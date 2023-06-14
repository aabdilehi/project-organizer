export class BadgeC {
  constructor(text = "New Badge", colour) {
    this.text = text;
    this.colour = !!colour ? colour : this.getRandomColour();
  }

  getData = () => ({
    text: this.text,
    colour: this.colour,
  });

  getRandomColour() {
    const potentialColours = [
      "whiteAlpha",
      "blackAlpha",
      "gray",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "cyan",
      "purple",
      "pink",
      "linkedin",
      "facebook",
      "messenger",
      "whatsapp",
      "twitter",
      "telegram",
    ];
    return potentialColours.splice(
      (Math.random() * potentialColours.length) | 0,
      1
    );
  }
}
