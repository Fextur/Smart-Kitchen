-- Insert mockup alerts data for user ID: 6bc3d746-aed9-4ec8-87d9-f874db230098
-- Run this script in pgAdmin Query Tool

INSERT INTO alerts (id, type, title, description, "isRead", "isApproved", "createdAt", "userId", "relatedUserId", "relatedUserName", metadata) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'add_kitchen',
    'מטבח חדש נוצר',
    'המטבח "מטבח משפחת כהן" נוצר בהצלחה',
    false,
    false,
    NOW() - INTERVAL '30 minutes',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    NULL,
    NULL,
    '{"kitchenName": "מטבח משפחת כהן"}'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'edit_kitchen',
    'המטבח עודכן',
    'שם המטבח השתנה ל''המטבח של המשפחה''',
    false,
    false,
    NOW() - INTERVAL '2 hours',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    NULL,
    NULL,
    '{"oldName": "מטבח משפחת כהן", "newName": "המטבח של המשפחה"}'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'add_to_shopping_list',
    'פריט נוסף לרשימת קניות',
    'חלב נוסף לרשימת הקניות על ידי דני',
    false,
    false,
    NOW() - INTERVAL '4 hours',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    NULL,
    NULL,
    '{"itemName": "חלב", "addedBy": "דני"}'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'edit_shopping_list',
    'רשימת קניות עודכנה',
    'הכמות של לחם השתנתה מ-2 ל-3 יחידות',
    false,
    false,
    NOW() - INTERVAL '6 hours',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    NULL,
    NULL,
    '{"itemName": "לחם", "oldQuantity": 2, "newQuantity": 3}'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'user_entered_kitchen',
    'משתמש נכנס למטבח',
    'שרה נכנסה למטבח',
    false,
    false,
    NOW() - INTERVAL '8 hours',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    '550e8400-e29b-41d4-a716-446655440099',
    'שרה',
    '{"userName": "שרה"}'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'user_left_kitchen',
    'משתמש יצא מהמטבח',
    'מיכל יצא מהמטבח',
    false,
    false,
    NOW() - INTERVAL '12 hours',
    '6bc3d746-aed9-4ec8-87d9-f874db230098',
    '550e8400-e29b-41d4-a716-446655440088',
    'מיכל',
    '{"userName": "מיכל"}'
);

-- Verify the data was inserted
SELECT * FROM alerts WHERE "userId" = '6bc3d746-aed9-4ec8-87d9-f874db230098' ORDER BY "createdAt" DESC;
