import prisma from '../models/prismaClient';
import { Contact } from '@prisma/client';

type ContactPayload = {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
};

export const processIdentity = async (
  email?: string,
  phoneNumber?: string
): Promise<ContactPayload> => {
  // Step 1: Find existing contacts matching email or phone
  const emailMatch = email
    ? await prisma.contact.findFirst({
        where: { email },
        orderBy: { createdAt: 'asc' }
      })
    : null;

  const phoneMatch = phoneNumber
    ? await prisma.contact.findFirst({
        where: { phoneNumber },
        orderBy: { createdAt: 'asc' }
      })
    : null;

  const emailId = emailMatch?.id ?? null;
  const phoneId = phoneMatch?.id ?? null;

  // Step 2: Case: Both email and phone match the same contact
  if (emailMatch && phoneMatch && emailId === phoneId) {
    const primaryId =
      emailMatch.linkPrecedence === 'primary'
        ? emailMatch.id
        : emailMatch.linkedId!;

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryId },
          { linkedId: primaryId }
        ]
      }
    });

    const emails = Array.from(
      new Set(contacts.map(c => c.email).filter((e): e is string => !!e))
    );

    const phoneNumbers = Array.from(
      new Set(contacts.map(c => c.phoneNumber).filter((p): p is string => !!p))
    );

    const secondaryContactIds = contacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);

    return {
      primaryContatctId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds
    };
  }

  // ✅ Step 2.5: Both email and phone match DIFFERENT primary contacts
  if (
    emailMatch &&
    phoneMatch &&
    emailId !== phoneId &&
    emailMatch.linkPrecedence === 'primary' &&
    phoneMatch.linkPrecedence === 'primary'
  ) {
    const [older, newer] =
      emailMatch.createdAt < phoneMatch.createdAt
        ? [emailMatch, phoneMatch]
        : [phoneMatch, emailMatch];
  
    // Step 1: Demote the newer one
    await prisma.contact.update({
      where: { id: newer.id },
      data: {
        linkPrecedence: 'secondary',
        linkedId: older.id
      }
    });
  
    // ✅ Step 2: Re-link secondaries of the newer one to point to the older one
    await prisma.contact.updateMany({
      where: { linkedId: newer.id },
      data: { linkedId: older.id }
    });
  
    // Step 3: Fetch updated contact group
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: older.id },
          { linkedId: older.id }
        ]
      }
    });
  
    const emails = Array.from(
      new Set(contacts.map(c => c.email).filter((e): e is string => !!e))
    );
  
    const phoneNumbers = Array.from(
      new Set(contacts.map(c => c.phoneNumber).filter((p): p is string => !!p))
    );
  
    const secondaryContactIds = contacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);
  
    return {
      primaryContatctId: older.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    };
  }
  
  // Step 3: Case: No matches at all → create primary
  if (!emailMatch && !phoneMatch) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      }
    });

    return {
      primaryContatctId: newContact.id,
      emails: email ? [email] : [],
      phoneNumbers: phoneNumber ? [phoneNumber] : [],
      secondaryContactIds: []
    };
  }

  // Step 4: Case: Only one matches → create secondary, link to matched one
  const matchedContact = emailMatch || phoneMatch;
  const primaryId =
    matchedContact!.linkPrecedence === 'primary'
      ? matchedContact!.id
      : matchedContact!.linkedId!;

  const newSecondary = await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkPrecedence: 'secondary',
      linkedId: primaryId
    }
  });

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    }
  });

  const emails = Array.from(
    new Set(contacts.map(c => c.email).filter((e): e is string => !!e))
  );

  const phoneNumbers = Array.from(
    new Set(contacts.map(c => c.phoneNumber).filter((p): p is string => !!p))
  );

  const secondaryContactIds = contacts
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

  return {
    primaryContatctId: primaryId,
    emails,
    phoneNumbers,
    secondaryContactIds
  };
};
