export class KitchenUtils {
  /**
   * Validate if a kitchen hash matches the expected format
   */
  static isValidHashFormat(hash: string): boolean {
    return /^[A-F0-9]{7}$/.test(hash);
  }

  /**
   * Format a kitchen hash for display (adds spaces for readability)
   */
  static formatHashForDisplay(hash: string): string {
    if (!this.isValidHashFormat(hash)) return hash;
    return hash.substring(0, 3) + " " + hash.substring(3);
  }

  /**
   * Clean and format user input for kitchen hash
   */
  static cleanHashInput(input: string): string {
    return input
      .replace(/[^A-Fa-f0-9]/g, "")
      .toUpperCase()
      .substring(0, 7);
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }
}
