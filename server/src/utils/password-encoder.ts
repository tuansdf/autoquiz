import bcryptjs from "bcryptjs";

const SALT_SIZE = 10;

class PasswordEncoder {
  public async encode(toBeHashed: string): Promise<string> {
    return await bcryptjs.hash(toBeHashed, SALT_SIZE);
  }
  public async verify(toBeVerified: string, hashed: string): Promise<boolean> {
    try {
      return await bcryptjs.compare(toBeVerified, hashed);
    } catch (e) {
      return false;
    }
  }
}

export const passwordEncoder = new PasswordEncoder();
