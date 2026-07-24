export const LST_RMK = [
  "",
  "Fabric Incoming Delay", // 원단 입고 지연 될 경우
  "Trim Material Incoming Delay", //부자재 입고 지연이 될 경우
  "Fabric Shortage", //정량 원단 입고 되었지만 생산 중 쇼트가 발생하여 라인 영향을 받을 경우
  "Trim Material", //정수량의 부자재 입고 되었지만 생산 중 쇼트가 발생하여 라인 영향을 받을 경우
  "New style-LINE CHANGE", //신규 Style투입으로 라인 변경 되는 경우
  "Mix production (Short quantity)", //1개라인에 2개 스타일 생산 시-라인 교체를 제외 하고 (일부 부족수 수량을 생산)하는 경우
  "Mix production (Repair)", //1개라인에 2개 스타일 생산 시-라인 교체를 제외 하고 (일부 수량 수리)를 하는 경우
  "Machine Breakedown", //기계 고장으로 생산성이 떨어진 경우
  "Too many Absence", //1-2명의 결근이 아니고 보다 많은 결근자로 라인 생산성에 영향을 준 경우
  "Not Enough Cutting Qty", //재단물 수량이 부족하게 봉제 라인에 공급되는 경우
  "Lower Printing Incoming Qty", //프린트/나염 후 봉제 목표 수량 보다 부족한 수량이 입고되는 경우
  "Lower Emb Incoming Qty", //자수 후 봉제 목표 수량 보다 부족한 수량이 입고되는 경우
  "Helper Production Delay", //봉제 라인의 보조작업자의 준비 수량이 지연되고 수량이 부족한 경우
  "Manpower support to other LINE", // 해당 라인의 미싱사가 타 라라인을 지원 하는 경우
  "Slow Job Pace", // 미싱 작업 속도가 느려 생산량이 저하되는 경우
  "Bottleneck due to Lower Skill", // 기능이 낮아 해당 공정이 병목공정화 되는 경우
  "Un-balanced LINE (Lower LOB%)", // 라인의 공정 밸런스가 좋지 않은 경우
  "Bottlneck due to Manpower shortage", // 병목 공정에서 인원이 충분하게 배치가 안된 경우
  "Overall lack of manpower", // 라인의 전체적인 인원 부족 현상으로 생산량 감소되는 경우
  "Lower Input Qty due to Material Defect", // 원단 불량으로 인해 투입량이 감소하여 생산량이 감소되는 경우 라인의 전체적인 인원 부족 현상으로 생산량 감소되는 경우(컬러매칭/고불량률 등)
];
