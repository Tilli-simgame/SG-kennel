// kennelStructure.js
export const kennelStructure = {
  ourKennel: {
    title: "Our Kennel",
    icon: "🏠",
    type: "root",
    children: {
      aboutUs: {
        title: "About Us (C:)",
        icon: "💿",
        type: "drive",
        children: {
          ourStory: { title: "Our Story", icon: "📄", type: "file" },
          kennelHistory: { title: "Kennel History", icon: "📄", type: "file" },
          staffMembers: { title: "Staff Members", icon: "📄", type: "file" },
        },
      },
      services: {
        title: "Services (D:)",
        icon: "💿",
        type: "drive",
        children: {
          grooming: { title: "Grooming Services", icon: "📄", type: "file" },
          boarding: { title: "Boarding & Daycare", icon: "📄", type: "file" },
          training: { title: "Training Programs", icon: "📄", type: "file" },
          breeding: { title: "Breeding Services", icon: "📄", type: "file" },
        },
      },
      facilities: {
        title: "Facilities (E:)",
        icon: "💿",
        type: "drive",
        children: {
          indoor: { title: "Indoor Areas", icon: "📄", type: "file" },
          outdoor: { title: "Outdoor Playgrounds", icon: "📄", type: "file" },
          grooming: { title: "Grooming Station", icon: "📄", type: "file" },
          blueprint: { title: "Kennels Blueprint", icon: "📄", type: "file" },
        },
      },
    },
  },
  ourDogs: {
    title: "Our Dogs",
    icon: "🐕",
    type: "root",
    children: {
      packOfPaws: {
        title: "Pack of Paws",
        icon: "📁",
        type: "folder",
        children: {
          example: { title: "Example", icon: "📄", type: "file" },
          dogB: { title: "Dog B", icon: "📄", type: "file" },
        },
      },
      breedingProgram: {
        title: "Breeding Program",
        icon: "📁",
        type: "folder",
        children: {
          studs: { title: "Available Studs", icon: "📄", type: "file" },
          litters: { title: "Expected Litters", icon: "📄", type: "file" },
          pastLitters: { title: "Past Litters", icon: "📄", type: "file" }
        },
      }
    },
  },
  photoGallery: {
    title: "Photo Gallery",
    icon: "📸",
    type: "root",
    children: {
      kennelPhotos: {
        title: "Kennel Photos",
        icon: "📁",
        type: "folder",
        children: {
          indoor: { title: "Indoor Facilities", icon: "🖼️", type: "file" },
          outdoor: { title: "Outdoor Areas", icon: "🖼️", type: "file" },
          playAreas: { title: "Play Areas", icon: "🖼️", type: "file" },
        },
      },
      dogPhotos: {
        title: "Dog Photos",
        icon: "📁",
        type: "folder",
        children: {
          show: { title: "Show Photos", icon: "🖼️", type: "file" },
          puppy: { title: "Puppy Photos", icon: "🖼️", type: "file" },
          daily: { title: "Daily Life", icon: "🖼️", type: "file" },
        },
      },
    },
  },
  communityHub: {
    title: "Community Hub",
    icon: "🌟",
    type: "root",
    children: {
      news: {
        title: "News & Updates",
        icon: "📁",
        type: "folder",
        children: {
          kennelNews: { title: "Kennel News", icon: "📄", type: "file" },
          events: { title: "Upcoming Events", icon: "📄", type: "file" },
          results: { title: "Show Results", icon: "📄", type: "file" },
        },
      },
      guestBook: {
        title: "Guest Book",
        icon: "📁",
        type: "folder",
        children: {
          testimonials: { title: "Testimonials", icon: "📄", type: "file" },
          stories: { title: "Customer Stories", icon: "📄", type: "file" },
          updates: { title: "Puppy Updates", icon: "📄", type: "file" },
        },
      },
    },
  },
  contactInfo: {
    title: "Contact & Info",
    icon: "⚙️",
    type: "root",
    children: {
      contact: {
        title: "Contact Information",
        icon: "📁",
        type: "folder",
        children: {
          location: {
            title: "Location & Directions",
            icon: "📄",
            type: "file",
          },
          phone: { title: "Phone Numbers", icon: "📄", type: "file" },
          email: { title: "Email Addresses", icon: "📄", type: "file" },
        },
      },
      booking: {
        title: "Book a Service",
        icon: "📁",
        type: "folder",
        children: {
          grooming: { title: "Grooming Appointment", icon: "📄", type: "file" },
          boarding: { title: "Boarding Request", icon: "📄", type: "file" },
          training: { title: "Training Inquiry", icon: "📄", type: "file" },
        },
      },
    },
  },
};

// Menu mapping configuration
export const menuMap = {
  "my-computer": "ourKennel",
  "my-documents": "ourDogs",
  "my-pictures": "photoGallery",
  "my-music": "communityHub",
  "control-panel": "contactInfo",
};
